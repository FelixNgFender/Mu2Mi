import { env } from '@/config/env';
import { fileStorage } from '@/infra';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { action, authAction } from '@/lib/safe-action';
import { findManyByTrackId as findManyAssetsByTrackId } from '@/models/asset';
import { findOne as findOneTrack } from '@/models/track';
import { findManyByUserId as findManyTracksByUserId } from '@/models/track';
import { z } from 'zod';

const getUserTracksSchema = z.object({});

export const getUserTracks = authAction(
    getUserTracksSchema,
    async ({}, { user }) => {
        return await findManyTracksByUserId(user.id);
    },
);

const downloadUserTrackAssetsSchema = z.object({
    trackId: z.string(),
});

export const downloadUserTrackAssets = authAction(
    downloadUserTrackAssetsSchema,
    async ({ trackId }, { user }) => {
        const [track, trackAssets] = await Promise.all([
            findOneTrack(trackId),
            findManyAssetsByTrackId(trackId),
        ]);
        if (!track || !trackAssets.length) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.notFound.humanMessage,
                true,
                httpStatus.clientError.notFound.code,
            );
        }
        if (
            !track.public &&
            trackAssets.some((asset) => asset.userId !== user.id)
        ) {
            throw new AppError(
                'HttpError',
                'Sorry, you are not allowed to view this track',
                true,
                httpStatus.clientError.unauthorized.code,
            );
        }
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

const downloadTrackAssetsSchema = z.object({
    trackId: z.string(),
});

export const downloadPublicTrackAssets = action(
    downloadTrackAssetsSchema,
    async ({ trackId }) => {
        const [track, trackAssets] = await Promise.all([
            findOneTrack(trackId),
            findManyAssetsByTrackId(trackId),
        ]);
        if (!track || !trackAssets.length) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.notFound.humanMessage,
                true,
                httpStatus.clientError.notFound.code,
            );
        }
        if (!track.public) {
            throw new AppError(
                'HttpError',
                'Sorry, you are not allowed to view this track',
                true,
                httpStatus.clientError.unauthorized.code,
            );
        }
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
