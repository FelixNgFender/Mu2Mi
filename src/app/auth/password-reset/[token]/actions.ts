'use server';

import { auth } from '@/lib/auth';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { action } from '@/lib/safe-action';
import { passwordResetModel } from '@/models/password-reset';
import { userModel } from '@/models/user';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isWithinExpirationDate } from 'oslo';
import { Argon2id } from 'oslo/password';

import { newPasswordFormSchema } from './schemas';

export const setNewPassword = action(
    newPasswordFormSchema,
    async ({ password, token }) => {
        const storedToken = await passwordResetModel.validateAndDelete(token);

        if (!storedToken || !isWithinExpirationDate(storedToken.expiresAt)) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.badRequest.humanMessage,
                true,
                httpStatus.clientError.badRequest.code,
            );
        }
        const user = await userModel.findOne(storedToken.userId);
        if (!user) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.badRequest.humanMessage,
                true,
                httpStatus.clientError.badRequest.code,
            );
        }
        await auth.invalidateUserSessions(user.id);
        const hashedPassword = await new Argon2id().hash(password);
        await userModel.updateOne(user.id, {
            hashedPassword,
        });

        const session = await auth.createSession(user.id, {});
        const sessionCookie = auth.createSessionCookie(session.id);
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );
        redirect('/');
    },
);
