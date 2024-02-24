'use server';

import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { replicateClient } from '@/lib/replicate';
import { authAction } from '@/lib/safe-action';
import { trackModel } from '@/models/track';
import { lyricsTranscriptionInputSchema } from '@/types/replicate';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = lyricsTranscriptionInputSchema
    .omit({
        audio: true,
    })
    .extend({
        name: z.string(),
        assetId: z.string(),
    });

export const transcribeLyrics = authAction(schema, async (data, { user }) => {
    const newTrack = await trackModel.createOneAndUpdateAsset(
        {
            userId: user.id,
            lyricsTranscriptionStatus: 'processing',
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

    const url = await fileStorageClient.presignedGetObject(
        env.S3_BUCKET_NAME,
        newTrack.assetName,
        env.S3_PRESIGNED_URL_EXPIRATION_S,
    );

    await replicateClient.lyricsTranscription({
        ...data,
        taskId: newTrack.trackId,
        userId: user.id,
        audio: url,
    });

    revalidatePath('/studio/lyrics'); // refresh track table on studio page
    return {
        success: true,
    };
});
