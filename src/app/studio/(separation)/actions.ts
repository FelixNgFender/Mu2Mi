'use server';

import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError, errorHandler } from '@/lib/error';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import { ActionResult } from '@/types/server-action';
import { revalidatePath } from 'next/cache';

import { Assets } from './track-table-columns';

export const downloadTrack = async (trackId: string): Promise<ActionResult> => {
    try {
        const trackAssets = await assetModel.findManyByUserId(trackId);
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
            error: 'Failed to download track',
        };
    }
};

export const deleteTrack = async (trackId: string): Promise<ActionResult> => {
    try {
        await trackModel.deleteOne(trackId);
        revalidatePath('/studio');
        return {
            success: true,
        };
    } catch (err) {
        errorHandler.handleError(err as Error);
        return {
            success: false,
            error: 'Failed to delete track',
        };
    }
};
