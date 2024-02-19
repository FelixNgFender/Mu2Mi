'use server';

import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { replicateClient } from '@/lib/replicate';
import { authAction } from '@/lib/safe-action';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
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

export const separateTrack = authAction(
    schema,
    async (data, { user }) => {
        const track = await trackModel.createOne({
            userId: user.id,
            trackSeparationStatus: 'processing',
            name: data.name,
        });

        if (!track) {
            throw new AppError(
                'HttpError',
                'Failed to create track',
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }

        const asset = await assetModel.updateOne(data.assetId, {
            trackId: track.id,
        });

        if (!asset) {
            throw new AppError(
                'HttpError',
                'Failed to update asset',
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }

        const url = await fileStorageClient.presignedGetObject(
            env.S3_BUCKET_NAME,
            asset.name,
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );

        await replicateClient.separateTrack({
            ...data,
            taskId: track.id,
            userId: user.id,
            audio: url,
        });

        revalidatePath('/studio/separation'); // refresh track table on studio page
        return {
            success: true,
        };
    },
);
