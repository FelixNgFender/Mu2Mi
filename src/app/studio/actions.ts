'use server';

import { assetConfig } from '@/config/asset';
import { env } from '@/config/env';
import { fileStorage } from '@/infra';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { authAction } from '@/lib/safe-action';
import { generateObjectKey } from '@/lib/utils';
import {
    createOne as createOneAsset,
    findManyByTrackId as findManyAssetsByTrackId,
} from '@/models/asset';
import {
    deleteOne as deleteOneTrack,
    findManyByUserId as findManyTracksByUserId,
} from '@/models/track';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const pollTracksSchema = z.object({});

/**
 * Server Action for this query because I don't want to write Route Handler. And
 * it's needed for real-time updates.
 */
export const pollUserTracks = authAction(
    pollTracksSchema,
    async ({}, { user }) => {
        return await findManyTracksByUserId(user.id);
    },
);

const downloadTrackSchema = z.object({
    trackId: z.string(),
});

export const downloadTrack = authAction(
    downloadTrackSchema,
    async ({ trackId }) => {
        const trackAssets = await findManyAssetsByTrackId(trackId);
        const promises = trackAssets.map(async (asset) => {
            const url = await fileStorage
                .presignedGetObject(
                    env.S3_BUCKET_NAME,
                    asset.name,
                    env.S3_PRESIGNED_URL_EXPIRATION_S,
                )
                .catch((err) => {
                    throw new AppError('FatalError', err.message, true);
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
        const assets = await findManyAssetsByTrackId(trackId);
        await fileStorage.removeObjects(
            env.S3_BUCKET_NAME,
            assets.map((asset) => asset.name),
        );
        await deleteOneTrack(trackId); // cascades to asset table
        revalidatePath('/studio');
    },
);

const getPresignedUrlSchema = z.object({
    type: z.enum(assetConfig.allowedMimeTypes),
    size: z.number().max(assetConfig.maxFileSizeBytes),
    extension: z.string(),
    checksum: z.string(),
});

export const getPresignedUrl = authAction(
    getPresignedUrlSchema,
    async ({ type, extension }, { user }) => {
        const objectName = generateObjectKey(extension);
        const url = await fileStorage.presignedPutObject(
            env.S3_BUCKET_NAME,
            objectName,
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );

        const newAsset = await createOneAsset({
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
