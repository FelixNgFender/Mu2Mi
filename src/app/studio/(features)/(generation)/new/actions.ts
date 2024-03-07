'use server';

import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { fileStorage } from '@/infra';
import { replicate } from '@/infra';
import { AppError, errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { authAction } from '@/lib/safe-action';
import { createOne, createOneAndUpdateAsset } from '@/models/track';
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
    try {
        await rateLimit.trackProcessing(user.id);
    } catch {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.tooManyRequests.humanMessage,
            true,
            httpStatus.clientError.tooManyRequests.code,
        );
    }

    if (data.assetId) {
        const newTrack = await createOneAndUpdateAsset(
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

        try {
            await replicate.generateMusic({
                ...data,
                taskId: newTrack.trackId,
                userId: user.id,
                input_audio: url,
            });
        } catch (error) {
            await errorHandler.handleError(error as Error);
            throw new AppError(
                'HttpError',
                httpStatus.serverError.internalServerError.humanMessage,
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }
    } else {
        const newTrack = await createOne({
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

        try {
            await replicate.generateMusic({
                ...data,
                taskId: newTrack.id,
                userId: user.id,
            });
        } catch (error) {
            await errorHandler.handleError(error as Error);
            throw new AppError(
                'HttpError',
                httpStatus.serverError.internalServerError.humanMessage,
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }
    }
    revalidatePath(siteConfig.paths.studio.musicGeneration); // refresh track table on generation page
    return {
        success: true,
    };
});
