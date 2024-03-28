'use server';

import { assetConfig } from '@/config/asset';
import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
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
    findOne as findOneTrack,
    updateOne as updateOneTrack,
} from '@/models/track';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
    downloadUserTrackAssets as downloadUserTrackAssetsQuery,
    getUserTracks as getUserTracksQuery,
} from './queries';

/*
 * Here we are re-exporting the queries to make them Server Actions
 * so they can be used in Client Components.
 */

export const pollUserTracks = getUserTracksQuery;

export const downloadUserTrackAssets = downloadUserTrackAssetsQuery;

const deleteTrackSchema = z.object({
    trackId: z.string(),
});

export const deleteUserTrack = authAction(
    deleteTrackSchema,
    async ({ trackId }, { user }) => {
        const assets = await findManyAssetsByTrackId(trackId);
        if (!assets.length) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.notFound.humanMessage,
                true,
                httpStatus.clientError.notFound.code,
            );
        }
        if (assets.some((asset) => asset.userId !== user.id)) {
            throw new AppError(
                'HttpError',
                'Sorry, you are not allowed to delete this track',
                true,
                httpStatus.clientError.unauthorized.code,
            );
        }
        await Promise.all([
            fileStorage.removeObjects(
                env.S3_BUCKET_NAME,
                assets.map((asset) => asset.name),
            ),
            deleteOneTrack(trackId), // cascades to asset table
        ]);
        revalidatePath(siteConfig.paths.studio.home);
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

const shareUserTrackSchema = z.object({
    trackId: z.string(),
    isPublic: z.boolean(),
});

export const shareUserTrack = authAction(
    shareUserTrackSchema,
    async ({ trackId, isPublic }, { user }) => {
        const track = await findOneTrack(trackId);
        if (!track) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.notFound.humanMessage,
                true,
                httpStatus.clientError.notFound.code,
            );
        }
        if (track.userId !== user.id) {
            throw new AppError(
                'HttpError',
                'Sorry, you are not allowed to share this track',
                true,
                httpStatus.clientError.unauthorized.code,
            );
        }
        await updateOneTrack(trackId, { public: isPublic });
        revalidatePath(siteConfig.paths.studio.home);
    },
);

const updateUserTrackSchema = z.object({
    trackId: z.string(),
    name: z.string(),
    public: z.boolean().optional(),
});

export const updateUserTrack = authAction(
    updateUserTrackSchema,
    async ({ trackId, name, public: isPublic }, { user }) => {
        const track = await findOneTrack(trackId);
        if (!track) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.notFound.humanMessage,
                true,
                httpStatus.clientError.notFound.code,
            );
        }
        if (track.userId !== user.id) {
            throw new AppError(
                'HttpError',
                'Sorry, you are not allowed to update this track',
                true,
                httpStatus.clientError.unauthorized.code,
            );
        }
        await updateOneTrack(trackId, { name, public: isPublic });
        revalidatePath(siteConfig.paths.studio.home);
    },
);
