'use server';

import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError, errorHandler } from '@/lib/error';
import { authAction } from '@/lib/safe-action';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const downloadTrackSchema = z.object({
    trackId: z.string(),
});

export const downloadTrack = authAction(
    downloadTrackSchema,
    async ({ trackId }) => {
        const trackAssets = await assetModel.findManyByTrackId(trackId);
        const promises = trackAssets.map(async (asset) => {
            const url = await fileStorageClient
                .presignedGetObject(
                    env.S3_BUCKET_NAME,
                    asset.name,
                    env.S3_PRESIGNED_URL_EXPIRATION_S,
                )
                .catch((err) => {
                    errorHandler.handleError(
                        new AppError('FatalError', err.message, true),
                    );
                    return '';
                });
            return { id: asset.id, url, type: asset.type };
        });
        const assets = await Promise.all(promises);
        return assets;
    },
);

const deleteTrackSchema = z.object({
    trackId: z.string(),
});

export const deleteTrack = authAction(
    deleteTrackSchema,
    async ({ trackId }) => {
        const assets = await assetModel.findManyByTrackId(trackId);
        await fileStorageClient.removeObjects(
            env.S3_BUCKET_NAME,
            assets.map((asset) => asset.name),
        );
        await trackModel.deleteOne(trackId); // cascades to asset table
        revalidatePath('/studio');
    },
);

const getTracksSchema = z.object({});

export const getTracks = authAction(getTracksSchema, async ({}, { user }) => {
    return await trackModel.findManyByUserId(user.id);
});
