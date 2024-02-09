import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError, errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { generatePublicId } from '@/lib/utils';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import { webhookMetadataSchema } from '@/types/replicate';
import { MidiTranscriptionWebhookBody } from '@/types/replicate';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { fileTypeFromBlob } from 'file-type';

export const POST = async (req: Request) => {
    const searchParams = new URL(req.url).searchParams;
    const parsedParams = webhookMetadataSchema.safeParse(
        Object.fromEntries(searchParams),
    );

    if (!parsedParams.success) {
        console.log('parsedParams errors: ', parsedParams.error.format());
        return HttpResponse.badRequest(parsedParams.error.format());
    }

    try {
        const { taskId, userId } = parsedParams.data;
        const body = await req.json();
        const { status, output, error } = body as MidiTranscriptionWebhookBody;

        if (error) {
            await trackModel.updateOne(taskId, {
                midiTranscriptionStatus: 'failed',
            });
            return HttpResponse.success();
        }

        // Handle duplicate webhooks
        const track = await trackModel.findOne(taskId);
        if (!track) {
            throw new AppError('FatalError', 'Failed to find track', true);
        }

        if (
            track.midiTranscriptionStatus === 'succeeded' ||
            status === 'starting'
        ) {
            return HttpResponse.success();
        }

        if (
            track.midiTranscriptionStatus === 'processing' &&
            (status === 'failed' || status === 'canceled')
        ) {
            await trackModel.updateOne(taskId, {
                midiTranscriptionStatus: status,
            });
            return HttpResponse.success();
        }

        if (
            track.midiTranscriptionStatus === 'processing' &&
            status === 'succeeded' &&
            output
        ) {
            const blob = await fetch(output).then((res) => res.blob());
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
                userId: userId,
                name: objectName,
                mimeType: mimeType as any,
                trackId: taskId,
                type: 'midi',
            });
            if (!newAsset) {
                throw new AppError(
                    'FatalError',
                    'Failed to create asset',
                    true,
                );
            }
            await trackModel.updateOne(taskId, {
                midiTranscriptionStatus: status,
            });
        }
        return HttpResponse.success();
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};
