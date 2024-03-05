'use server';

import { siteConfig } from '@/config/site';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { authAction } from '@/lib/safe-action';
import { updateOne as updateOneUser } from '@/models/user';
import { revalidatePath } from 'next/cache';

import { userFormSchema } from './schemas';

const schema = userFormSchema;

export const editProfile = authAction(schema, async (newUser, { user }) => {
    try {
        await updateOneUser(user.id, newUser);
    } catch (error) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.badRequest.humanMessage,
            true,
            httpStatus.clientError.badRequest.code,
        );
    }
    revalidatePath(siteConfig.paths.settings);
});
