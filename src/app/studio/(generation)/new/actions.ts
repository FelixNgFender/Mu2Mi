'use server';

import { env } from '@/config/env';
import { fileStorage } from '@/infra';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { replicate } from '@/infra';
import { authAction } from '@/lib/safe-action';
import { trackModel } from '@/models/track';
import { musicGenerationInputSchema } from '@/types/replicate';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = musicGenerationInputSchema
    .omit({
        input_audio: true,
    })
    .extend({
        name: z.string(),
        assetId: z.string().optional(),
    });

export const generateMusic = authAction(schema, async (data, { user }) => {
    if (data.assetId) {
        const newTrack = await trackModel.createOneAndUpdateAsset(
            {
                userId: user.id,
                musicGenerationStatus: 'processing',
                name: data.name,
            },
            data.assetId,
        );

        if (!newTrack) {
            throw new AppError(
                'HttpError',
                'Failed to create track',
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }

        const url = await fileStorage.presignedGetObject(
            env.S3_BUCKET_NAME,
            newTrack.assetName,
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );

        await replicate.generateMusic({
            ...data,
            taskId: newTrack.trackId,
            userId: user.id,
            input_audio: url,
        });
    } else {
        const newTrack = await trackModel.createOne({
            userId: user.id,
            musicGenerationStatus: 'processing',
            name: data.name,
        });

        if (!newTrack) {
            throw new AppError(
                'HttpError',
                'Failed to create track',
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }

        await replicate.generateMusic({
            ...data,
            taskId: newTrack.id,
            userId: user.id,
        });
    }
    revalidatePath('/studio'); // refresh track table on generation page
    return {
        success: true,
    };
});
