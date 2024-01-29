'use server';

import { assetConfig } from '@/config/asset';
import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { getUserSession } from '@/lib/auth';
import { AppError } from '@/lib/error';
import { errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { assetModel } from '@/models/asset';
import { ActionResult } from '@/types/server-action';
import crypto from 'crypto';
import { z } from 'zod';

export const getPresignedUrl = async (
    data: SignedUrlBodySchemaType,
): Promise<ActionResult> => {
    const { user } = await getUserSession();
    if (!user) {
        return {
            success: false,
            error: httpStatus.clientError.unauthorized.humanMessage,
        };
    }
    if (!user.emailVerified) {
        return {
            success: false,
            error: httpStatus.clientError.unprocessableEntity.humanMessage,
        };
    }
    const { type, size, checksum } = data;
    const result = signedUrlBodySchema.safeParse({
        type,
        size,
        checksum,
    });

    if (!result.success) {
        return {
            success: false,
            error: JSON.stringify(result.error.issues),
        };
    }

    try {
        const url = await fileStorageClient.presignedPutObject(
            env.S3_BUCKET_NAME,
            crypto.randomBytes(32).toString('hex'),
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );

        const newAsset = await assetModel.createOne({
            mimeType: type,
            url,
            userId: user.id,
        });

        if (!newAsset)
            throw new AppError(
                'HttpError',
                'Failed to create asset',
                true,
                httpStatus.serverError.internalServerError.code,
            );

        return {
            success: true,
            data: {
                url,
                id: newAsset.id,
            },
        };
    } catch (err) {
        errorHandler.handleError(err as Error);
        return {
            success: false,
            error: httpStatus.serverError.internalServerError.humanMessage,
        };
    }
};

const signedUrlBodySchema = z.object({
    type: z.enum(assetConfig.allowedFileTypes),
    size: z.number().max(assetConfig.maxFileSize),
    checksum: z.string(),
});

type SignedUrlBodySchemaType = z.infer<typeof signedUrlBodySchema>;
