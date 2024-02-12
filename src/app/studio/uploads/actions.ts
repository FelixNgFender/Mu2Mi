'use server';

import { assetConfig } from '@/config/asset';
import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { getUserSession } from '@/lib/auth';
import { AppError } from '@/lib/error';
import { errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { generatePublicId } from '@/lib/utils';
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
    const { type, extension, size, checksum } = data;
    const result = signedUrlBodySchema.safeParse({
        type,
        extension,
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
        const objectName = `${crypto
            .randomBytes(32)
            .toString('hex')}.${extension}`;
        const url = await fileStorageClient.presignedPutObject(
            env.S3_BUCKET_NAME,
            objectName,
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );

        const newAsset = await assetModel.createOne({
            id: generatePublicId(),
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
            success: true,
            data: {
                url,
                assetId: newAsset.id,
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
    type: z.enum(assetConfig.allowedMimeTypes),
    size: z.number().max(assetConfig.maxFileSizeBytes),
    extension: z.string(),
    checksum: z.string(),
});

type SignedUrlBodySchemaType = z.infer<typeof signedUrlBodySchema>;
