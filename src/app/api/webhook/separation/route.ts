import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError, errorHandler } from '@/lib/error';
import { webhookMetadataSchema } from '@/lib/replicate';
import { HttpResponse } from '@/lib/response';
import { generatePublicId } from '@/lib/utils';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

export const POST = async (req: Request) => {
    const searchParams = new URL(req.url).searchParams;
    const parsedParams = webhookMetadataSchema.safeParse(
        Object.fromEntries(searchParams),
    );

    console.log('incoming webhook from Replicate: ', req);
    console.log('parsedParams: ', parsedParams);

    if (!parsedParams.success) {
        return HttpResponse.badRequest(parsedParams.error.format());
    }

    try {
        const { taskId, userId } = parsedParams.data;
        const body = await req.json();
        const { status, output, error } = body as replicateWebhookBody;
        console.log('webhook body: ', body);
        console.log('webhook status: ', status);
        console.log('webhook output: ', output);
        console.log('webhook error: ', error);
        if (error) {
            throw new AppError('ReplicateError', error, true);
        }
        if (status === 'starting') {
            await trackModel.updateOne(taskId, {
                status: 'processing',
            });
            return HttpResponse.success();
        }
        if (status === 'failed' || status === 'canceled') {
            await trackModel.updateOne(taskId, {
                status,
            });
            return HttpResponse.success();
        }
        if (status === 'succeeded') {
            // Handle duplicate webhooks
            const track = await trackModel.findOne(taskId);
            if (!track) {
                throw new AppError('FatalError', 'Failed to find track', true);
            }

            if (track.status === 'succeeded') {
                return HttpResponse.success();
            }

            for (const [stem, url] of Object.entries(output)) {
                if (url) {
                    const buffer = Buffer.from(
                        await fetch(url).then((res) => res.arrayBuffer()),
                    );
                    const mimeType = (await fileTypeFromBuffer(buffer))?.mime;
                    const objectName = crypto.randomBytes(32).toString('hex');
                    await fileStorageClient.putObject(
                        env.S3_BUCKET_NAME,
                        objectName,
                        buffer,
                    );
                    const newAsset = await assetModel.createOne({
                        id: generatePublicId(),
                        userId: userId,
                        name: objectName,
                        mimeType: mimeType as any,
                    });
                    if (!newAsset) {
                        throw new AppError(
                            'FatalError',
                            'Failed to create asset',
                            true,
                        );
                    }
                    if (stem === 'other') {
                        await trackModel.updateOne(taskId, {
                            status: 'succeeded',
                            accompanimentAssetId: newAsset.id,
                        });
                    } else {
                        await trackModel.updateOne(taskId, {
                            status: 'succeeded',
                            [`${stem}AssetId`]: newAsset.id,
                        });
                    }
                }
            }
        }
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};

type replicateWebhookBody = {
    status: 'starting' | 'succeeded' | 'failed' | 'canceled';
    output: {
        bass: string | null;
        drums: string | null;
        other: string | null;
        piano: string | null;
        guitar: string | null;
        vocals: string | null;
    };
    error: string | null;
};
