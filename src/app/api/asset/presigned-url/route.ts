import { fileStorageClient } from '@/db';
import { db } from '@/db';
import { asset as assetTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { HttpResponse } from '@/lib/response';
import { InferInsertModel } from 'drizzle-orm';
import { NextRequest } from 'next/server';

// fileStorageClient.presignedPutObject

export const GET = async (request: NextRequest) => {
    const authRequest = auth.handleRequest(request);
    const session = await authRequest.validate();
    if (!session) {
        return HttpResponse.unauthorized();
    }
    if (!session.user.emailVerified) {
        return HttpResponse.unprocessableEntity('Email not verified');
    }
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const size = searchParams.get('size');
    if (!name || !type || !size) {
        return HttpResponse.unprocessableEntity('Missing name or type');
    }

    // The uploaded asset will be stored in the S3 bucket
    // with a name matching the id (PK) of the `asset` table
    const asset = await createAsset({
        userId: session.user.userId,
        name,
        mimeType: type,
        size: Number(size),
    });

    // TODO: handle error, centralize logging
    if (!asset) {
        return HttpResponse.internalServerError();
    }
    let presignedUrl = '';
    try {
        presignedUrl = await fileStorageClient.presignedPutObject(
            env.S3_BUCKET_NAME,
            `${session.user.userId}/${name}.${type}`,
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );
    } catch (err) {
        logger.error(err);
    }
    return HttpResponse.success({ presignedUrl });
};

const createAsset = async (asset: InferInsertModel<typeof assetTable>) => {
    return (await db.insert(assetTable).values(asset).returning())[0];
};
