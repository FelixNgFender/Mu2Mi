'use server';

import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { getUserSession } from '@/lib/auth';
import { AppError, errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import { ActionResult } from '@/types/server-action';
import { revalidatePath } from 'next/cache';

import { Assets } from './track-table-columns';

export const downloadTrack = async (trackId: string): Promise<ActionResult> => {
    const { user } = await getUserSession();
    if (!user) {
        return {
            success: false,
            error: httpStatus.clientError.unauthorized.humanMessage,
        };
    }
    try {
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
            return { url, type: asset.type };
        });
        const assets: Assets = await Promise.all(promises);
        return {
            success: true,
            data: assets,
        };
    } catch (err) {
        errorHandler.handleError(err as Error);
        return {
            success: false,
            error: httpStatus.serverError.internalServerError.humanMessage,
        };
    }
};

export const deleteTrack = async (trackId: string): Promise<ActionResult> => {
    const { user } = await getUserSession();
    if (!user) {
        return {
            success: false,
            error: httpStatus.clientError.unauthorized.humanMessage,
        };
    }
    try {
        const assets = await assetModel.findManyByTrackId(trackId);
        await fileStorageClient.removeObjects(
            env.S3_BUCKET_NAME,
            assets.map((asset) => asset.name),
        );
        await trackModel.deleteOne(trackId); // cascades to asset table
        revalidatePath('/studio');
        return {
            success: true,
        };
    } catch (err) {
        errorHandler.handleError(err as Error);
        return {
            success: false,
            error: httpStatus.serverError.internalServerError.humanMessage,
        };
    }
};

export const getTracks = async (): Promise<ActionResult> => {
    const { user } = await getUserSession();
    if (!user) {
        return {
            success: false,
            error: httpStatus.clientError.unauthorized.humanMessage,
        };
    }
    try {
        const tracks = await trackModel.findManyByUserId(user.id);
        return {
            success: true,
            data: tracks,
        };
    } catch (error) {
        errorHandler.handleError(error as Error);
        return {
            success: false,
            error: httpStatus.serverError.internalServerError.humanMessage,
        };
    }
};
