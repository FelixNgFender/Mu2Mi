'use server';

import { assetConfig } from '@/config/asset';
import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { authAction } from '@/lib/safe-action';
import { generatePublicId } from '@/lib/utils';
import { assetModel } from '@/models/asset';
import crypto from 'crypto';
import { z } from 'zod';

const schema = z.object({
    type: z.enum(assetConfig.allowedMimeTypes),
    size: z.number().max(assetConfig.maxFileSizeBytes),
    extension: z.string(),
    checksum: z.string(),
});

export const getPresignedUrl = authAction(
    schema,
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
            url,
            assetId: newAsset.id,
        };
    },
);
