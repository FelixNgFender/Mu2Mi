import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { getUserSession } from '@/lib/auth';
import { AppError, errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { HttpResponse } from '@/lib/response';
import { assetModel } from '@/models/asset';
import {
    SignedUrlBodySchemaServerType,
    signedUrlBodySchemaServer,
} from '@/validations/server/asset';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    const { user } = await getUserSession();
    if (!user) {
        return HttpResponse.unauthorized();
    }

    if (!user.emailVerified) {
        return HttpResponse.unprocessableEntity('Email not verified');
    }

    const data: SignedUrlBodySchemaServerType = await request.json();
    const { type, size, checksum } = data;

    const result = signedUrlBodySchemaServer.safeParse({
        type,
        size,
        checksum,
    });

    if (!result.success) {
        return HttpResponse.badRequest(JSON.stringify(result.error.issues));
    }

    try {
        const url = await fileStorageClient.presignedPutObject(
            env.S3_BUCKET_NAME,
            generateFileName(),
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

        return HttpResponse.success({
            url,
            id: newAsset.id,
        });
    } catch (err) {
        errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};

const generateFileName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString('hex');
