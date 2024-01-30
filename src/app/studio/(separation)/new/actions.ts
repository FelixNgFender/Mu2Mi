'use server';

import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { getUserSession } from '@/lib/auth';
import { AppError } from '@/lib/error';
import { errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { replicateClient } from '@/lib/replicate';
import { generatePublicId } from '@/lib/utils';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import { NewTrack } from '@/models/track';
import { models } from '@/types/replicate';
import { ActionResult } from '@/types/server-action';
import { z } from 'zod';

export const separateTrack = async (
    data: ClientDataSchemaType,
): Promise<ActionResult> => {
    const { user } = await getUserSession();
    if (!user) {
        return {
            success: false,
            error: httpStatus.clientError.unauthorized.humanMessage,
        };
    }
    if (!user.emailVerified) {
        return {
            success: false,
            error: httpStatus.clientError.unprocessableEntity.humanMessage,
        };
    }

    const result = clientFormSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            error: JSON.stringify(result.error.issues),
        };
    }

    try {
        console.log('data inserting into track table', data);
        const track = await trackModel.createOne({
            id: generatePublicId(),
            userId: user.id,
            status: 'starting',
            ...data,
        });

        if (!track || !track.originalAssetId) {
            throw new AppError(
                'HttpError',
                'Failed to create track',
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }

        const asset = await assetModel.findOne(track.originalAssetId);

        if (!asset) {
            throw new AppError(
                'HttpError',
                'Failed to find asset',
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }

        const url = await fileStorageClient.presignedGetObject(
            env.S3_BUCKET_NAME,
            asset.name,
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );
        console.log('S3 GET URL', url);

        const prediction = await replicateClient.separateTrack({
            ...data,
            taskId: track.id,
            audio: url,
        });
        console.log('Replicate prediction', prediction);

        return {
            success: true,
            data: {
                predictionId: prediction.id,
            },
        };
    } catch (err) {
        errorHandler.handleError(err as Error);
        return {
            success: false,
            error: httpStatus.serverError.internalServerError.humanMessage,
        };
    }
};

const clientFormSchema = z.object({
    model_name: z
        .enum([...models.map((model) => model.name)] as [string, ...string[]])
        .default('htdemucs'),
    stem: z
        .enum(['vocals', 'bass', 'drums', 'guitar', 'piano', 'other'])
        .optional(),
    clip_mode: z.enum(['rescale', 'clamp']).default('rescale'),
    shifts: z.number().int().min(1).max(10).default(1),
    overlap: z.number().default(0.25),
    output_format: z.enum(['mp3', 'wav', 'flac']).default('mp3'),
    mp3_bitrate: z.number().int().default(320),
    float32: z.boolean().default(false),
});

type ClientFormSchemaType = z.infer<typeof clientFormSchema>;
type ClientDataSchemaType = Pick<NewTrack, 'originalAssetId' | 'name'> &
    ClientFormSchemaType;
