import { assetConfig } from '@/config/asset';
import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import {
    ReplicateWebhookBodyTypes,
    webhookMetadataSchema,
} from '@/types/replicate';
import crypto from 'crypto';
import { fileTypeFromBlob } from 'file-type';
import { headers } from 'next/headers';

export const replicateWebhookHandler = async <
    T extends ReplicateWebhookBodyTypes,
>(
    req: Request,
    statusField:
        | 'musicgenStatus'
        | 'riffusionStatus'
        | 'midiTranscriptionStatus'
        | 'trackSeparationStatus',
    trackType?: (typeof assetConfig.trackAssetTypes)[number],
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
        } else if (typeof output === 'object' && trackType === 'riffusion') {
            await saveTrackAssetAndMetadata(
                taskId,
                userId,
                (output as any).audio,
                trackType,
            );
        } else if (
            typeof output === 'object' &&
            statusField === 'trackSeparationStatus'
        ) {
            await Promise.all(
                Object.entries(output).map(async ([stem, url]) => {
                    if (url) {
                        await saveTrackAssetAndMetadata(
                            taskId,
                            userId,
                            url,
                            stem === 'other' ? 'accompaniment' : (stem as any),
                        );
                    }
                }),
            );
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
    url: string,
    trackType?: (typeof assetConfig.trackAssetTypes)[number],
) => {
    const blob = await fetch(url).then((res) => res.blob());
    const fileType = await fileTypeFromBlob(blob);
    const fileExtension = fileType?.ext;
    const mimeType = fileType?.mime;
    const objectName = `${crypto
        .randomBytes(32)
        .toString('hex')}.${fileExtension}`;
    await fileStorageClient.putObject(
        env.S3_BUCKET_NAME,
        objectName,
        Buffer.from(await blob.arrayBuffer()),
        {
            'Content-Type': mimeType || 'binary/octet-stream',
        },
    );
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
