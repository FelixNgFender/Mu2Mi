import { env } from '@/config/env';
import { fileStorage } from '@/infra';
import { AppError } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { generateObjectKey } from '@/lib/utils';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import {
    ReplicateWebhookBodyTypes,
    webhookMetadataSchema,
} from '@/types/replicate';
import { TrackAssetType, TrackStatusColumn } from '@/types/studio';
import crypto from 'crypto';
import { headers } from 'next/headers';
import path from 'path';

export const replicateWebhookHandler = async <
    T extends ReplicateWebhookBodyTypes,
>(
    req: Request,
    statusField: TrackStatusColumn,
    trackType?: TrackAssetType,
) => {
    // https://replicate.com/docs/webhooks#verifying-webhooks
    const body = await req.json();
    const headersList = headers();
    const webhookId = headersList.get('webhook-id');
    const webhookTimestamp = headersList.get('webhook-timestamp');
    const webhookSignatures = headersList.get('webhook-signature');
    const signedContent = `${webhookId}.${webhookTimestamp}.${JSON.stringify(
        body,
    )}`;

    if (
        !webhookId ||
        !webhookTimestamp ||
        !webhookSignatures ||
        !signedContent
    ) {
        return HttpResponse.badRequest('Missing required headers');
    }

    const secretBytes = Buffer.from(
        // @ts-expect-error - Replicate webhook signing key should have base64 portion after _
        env.REPLICATE_WEBHOOK_SECRET.split('_')[1],
        'base64',
    );
    const computedSignature = crypto
        .createHmac('sha256', secretBytes)
        .update(signedContent)
        .digest('base64');
    const expectedSignatures = webhookSignatures
        .split(' ')
        .map((sig) => sig.split(',')[1]);
    if (
        !expectedSignatures.some(
            (expectedSignature) => expectedSignature === computedSignature,
        )
    ) {
        return HttpResponse.badRequest('Invalid signature');
    }

    const tolerance = 5 * 60 * 1000; // 5 minutes tolerance
    const currentTimestamp = Math.floor(Date.now() / 1000); // current timestamp in seconds
    const webhookTimestampSeconds = parseInt(webhookTimestamp);

    if (Math.abs(currentTimestamp - webhookTimestampSeconds) > tolerance) {
        return HttpResponse.badRequest('Timestamp out of tolerance');
    }

    const searchParams = new URL(req.url).searchParams;
    const parsedParams = webhookMetadataSchema.safeParse(
        Object.fromEntries(searchParams),
    );

    if (!parsedParams.success) {
        return HttpResponse.badRequest(parsedParams.error.format());
    }

    const { taskId, userId } = parsedParams.data;
    const { status, output, error } = body as T;

    if (error) {
        await trackModel.updateOne(taskId, {
            [statusField]: 'failed',
        });
        return HttpResponse.success();
    }

    const track = await trackModel.findOne(taskId);
    if (!track) {
        throw new AppError('FatalError', 'Failed to find track', true);
    }

    if (track[statusField] === 'succeeded' || status === 'starting') {
        return HttpResponse.success();
    }

    if (
        track[statusField] === 'processing' &&
        (status === 'failed' || status === 'canceled')
    ) {
        await trackModel.updateOne(taskId, {
            [statusField]: status,
        });
        return HttpResponse.success();
    }

    if (
        track[statusField] === 'processing' &&
        status === 'succeeded' &&
        output
    ) {
        if (typeof output === 'string') {
            await saveTrackAssetAndMetadata(taskId, userId, output, trackType);
        } else if (
            statusField === 'styleRemixStatus' &&
            Array.isArray(output)
        ) {
            await Promise.all(
                output.map(async (url) => {
                    if (url) {
                        await saveTrackAssetAndMetadata(
                            taskId,
                            userId,
                            url,
                            'remix',
                        );
                    }
                }),
            );
        } else if (
            statusField === 'trackSeparationStatus' &&
            typeof output === 'object'
        ) {
            await Promise.all(
                Object.entries(output).map(async ([stem, url]) => {
                    if (url && typeof url === 'string') {
                        await saveTrackAssetAndMetadata(
                            taskId,
                            userId,
                            url,
                            stem === 'other' ? 'accompaniment' : (stem as any),
                        );
                    }
                }),
            );
        } else if (
            statusField === 'trackAnalysisStatus' &&
            Array.isArray(output)
        ) {
            await Promise.all(
                output.map(async (url) => {
                    if (url) {
                        const extension = path.extname(url);
                        switch (extension) {
                            case '.json': {
                                await saveTrackAssetAndMetadata(
                                    taskId,
                                    userId,
                                    url,
                                    'analysis',
                                );
                                break;
                            }
                            case '.png': {
                                await saveTrackAssetAndMetadata(
                                    taskId,
                                    userId,
                                    url,
                                    'analysis_viz',
                                );
                                break;
                            }
                            case '.mp3': {
                                await saveTrackAssetAndMetadata(
                                    taskId,
                                    userId,
                                    url,
                                    'analysis_sonic',
                                );
                                break;
                            }
                        }
                    }
                }),
            );
        } else if (
            statusField === 'lyricsTranscriptionStatus' &&
            typeof output === 'object'
        ) {
            await saveTrackAssetAndMetadata(taskId, userId, output, 'lyrics');
        }
        await trackModel.updateOne(taskId, {
            [statusField]: status,
        });
    }
    return HttpResponse.success();
};

const saveTrackAssetAndMetadata = async (
    taskId: string,
    userId: string,
    data: string | Record<string, any>,
    trackType?: TrackAssetType,
) => {
    let objectName: string;
    let mimeType: string;
    let fileData: Buffer;

    if (typeof data === 'string') {
        const blob = await fetch(data).then((res) => res.blob());
        objectName = generateObjectKey(path.extname(data));
        mimeType = blob.type === '' ? 'application/octet-stream' : blob.type;
        fileData = Buffer.from(await blob.arrayBuffer());
    } else {
        objectName = generateObjectKey('.json');
        mimeType = 'application/json';
        fileData = Buffer.from(JSON.stringify(data));
    }

    await fileStorage.putObject(env.S3_BUCKET_NAME, objectName, fileData, {
        'Content-Type': mimeType,
    });
    const newAsset = await assetModel.createOne({
        userId,
        name: objectName,
        mimeType: mimeType as any,
        trackId: taskId,
        type: trackType,
    });
    if (!newAsset) {
        throw new AppError('FatalError', 'Failed to create asset', true);
    }
};
