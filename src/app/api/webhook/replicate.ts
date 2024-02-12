import { assetConfig } from '@/config/asset';
import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { generatePublicId } from '@/lib/utils';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import {
    ReplicateWebhookBodyTypes,
    webhookMetadataSchema,
} from '@/types/replicate';
import crypto from 'crypto';
import { fileTypeFromBlob } from 'file-type';

export const replicateWebhookHandler = async <
    T extends ReplicateWebhookBodyTypes,
>(
    req: Request,
    statusField:
        | 'musicgenStatus'
        | 'riffusionStatus'
        | 'midiTranscriptionStatus'
        | 'trackSeparationStatus'
        | 'smartMetronomeStatus',
    trackType?: (typeof assetConfig.trackAssetTypes)[number],
) => {
    const searchParams = new URL(req.url).searchParams;
    const parsedParams = webhookMetadataSchema.safeParse(
        Object.fromEntries(searchParams),
    );

    if (!parsedParams.success) {
        return HttpResponse.badRequest(parsedParams.error.format());
    }

    const { taskId, userId } = parsedParams.data;
    const body = await req.json();
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
        } else if (typeof output === 'object' && trackType === 'metronome') {
            await saveTrackAssetAndMetadata(
                taskId,
                userId,
                (output as any).click,
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
        id: generatePublicId(),
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
