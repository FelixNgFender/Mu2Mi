'use server';

import { env } from '@/config/env';
import { fileStorageClient } from '@/db';
import { getUserSession } from '@/lib/auth';
import { AppError } from '@/lib/error';
import { errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { replicateClient } from '@/lib/replicate';
import { generatePublicId } from '@/lib/utils';
import { assetModel } from '@/models/asset';
import { trackModel } from '@/models/track';
import { NewTrack } from '@/models/track';
import { midiTranscriptionInputSchema } from '@/types/replicate';
import { ActionResult } from '@/types/server-action';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export const transcribeMidi = async (
    data: ClientDataSchemaType,
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

    const result = clientFormSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            error: JSON.stringify(result.error.issues),
        };
    }

    try {
        const track = await trackModel.createOne({
            id: generatePublicId(),
            userId: user.id,
            midiTranscriptionStatus: 'processing',
            name: data.name,
        });

        if (!track) {
            throw new AppError(
                'HttpError',
                'Failed to create track',
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }

        const asset = await assetModel.updateOne(data.assetId, {
            trackId: track.id,
        });

        if (!asset) {
            throw new AppError(
                'HttpError',
                'Failed to update asset',
                true,
                httpStatus.serverError.internalServerError.code,
            );
        }

        const url = await fileStorageClient.presignedGetObject(
            env.S3_BUCKET_NAME,
            asset.name,
            env.S3_PRESIGNED_URL_EXPIRATION_S,
        );

        await replicateClient.midiTranscription({
            ...data,
            taskId: track.id,
            userId: user.id,
            audio_file: url,
        });

        revalidatePath('/studio/midi'); // refresh track table on midi page
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

const clientFormSchema = midiTranscriptionInputSchema.omit({
    audio_file: true,
});

type ClientFormSchemaType = z.infer<typeof clientFormSchema>;
type ClientDataSchemaType = Pick<NewTrack, 'name'> &
    ClientFormSchemaType & {
        assetId: string;
    };
