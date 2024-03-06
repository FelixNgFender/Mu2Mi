'use server';

import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { fileStorage } from '@/infra';
import { replicate } from '@/infra';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { authAction } from '@/lib/safe-action';
import { createOneAndUpdateAsset } from '@/models/track';
import { trackSeparationInputSchema } from '@/types/replicate';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = trackSeparationInputSchema
    .omit({
        audio: true,
    })
    .extend({
        name: z.string(),
        assetId: z.string(),
    });

export const separateTrack = authAction(schema, async (data, { user }) => {
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

    const newTrack = await createOneAndUpdateAsset(
        {
            userId: user.id,
            trackSeparationStatus: 'processing',
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

    await replicate.separateTrack({
        ...data,
        taskId: newTrack.trackId,
        userId: user.id,
        audio: url,
    });

    revalidatePath(siteConfig.paths.studio.trackSeparation); // refresh track table on studio page
    return {
        success: true,
    };
});
