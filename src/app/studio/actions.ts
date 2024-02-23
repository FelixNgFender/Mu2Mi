'use server';

import { assetConfig } from '@/config/asset';
import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError, errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { authAction } from '@/lib/safe-action';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import crypto from 'crypto';
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

const getPresignedUrlSchema = z.object({
    type: z.enum(assetConfig.allowedMimeTypes),
    size: z.number().max(assetConfig.maxFileSizeBytes),
    extension: z.string(),
    checksum: z.string(),
});

export const getPresignedUrl = authAction(
    getPresignedUrlSchema,
    async ({ type, extension }, { user }) => {
        const objectName = `${crypto
            .randomBytes(32)
            .toString('hex')}.${extension}`;
        const url = await fileStorageClient.presignedPutObject(
            env.S3_BUCKET_NAME,
            objectName,
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );

        const newAsset = await assetModel.createOne({
            userId: user.id,
            // we will put faith in the client to actually upload the file to S3
            // better solution would be set up a trigger on the S3 bucket to create the asset
            name: objectName,
            mimeType: type,
            type: 'original',
        });

        if (!newAsset)
            throw new AppError(
                'HttpError',
                'Failed to create asset',
                true,
                httpStatus.serverError.internalServerError.code,
            );

        return {
            url,
            assetId: newAsset.id,
        };
    },
);
