'use server';

import { siteConfig } from '@/config/site';
import { auth } from '@/lib/auth';
import { sendEmailVerificationCode } from '@/lib/email';
import { AppError, errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { action } from '@/lib/safe-action';
import { generateEmailVerificationCode } from '@/lib/token';
import {
    deleteAllByUserId,
    validateAndDelete,
} from '@/models/email-verification';
import { getUserSession, updateOne } from '@/models/user';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isWithinExpirationDate } from 'oslo';
import { z } from 'zod';

import { verifyCodeFormSchema } from './schemas';

const verifyCodeSchema = verifyCodeFormSchema;

export const verifyCode = action(verifyCodeSchema, async ({ code }) => {
    const { user } = await getUserSession();

    if (!user) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.unauthorized.humanMessage,
            true,
            httpStatus.clientError.unauthorized.code,
        );
    }

    if (user.emailVerified) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.badRequest.humanMessage,
            true,
            httpStatus.clientError.badRequest.code,
        );
    }

    try {
        await rateLimit.verifyCode(user.id);
    } catch {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.tooManyRequests.humanMessage,
            true,
            httpStatus.clientError.tooManyRequests.code,
        );
    }

    const databaseCode = await validateAndDelete(user.id);

    if (!databaseCode || databaseCode.code !== code) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.badRequest.humanMessage,
            true,
            httpStatus.clientError.badRequest.code,
        );
    }
    if (!isWithinExpirationDate(databaseCode.expiresAt)) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.badRequest.humanMessage,
            true,
            httpStatus.clientError.badRequest.code,
        );
    }
    if (user.email !== databaseCode.email) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.badRequest.humanMessage,
            true,
            httpStatus.clientError.badRequest.code,
        );
    }

    await auth.invalidateUserSessions(user.id);
    await updateOne(user.id, {
        emailVerified: true,
    });

    const session = await auth.createSession(user.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    redirect(siteConfig.paths.studio.home);
});

const resendCodeSchema = z.object({});

export const resendCode = action(resendCodeSchema, async () => {
    const { user } = await getUserSession();

    if (!user) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.unauthorized.humanMessage,
            true,
            httpStatus.clientError.unauthorized.code,
        );
    }

    if (user.emailVerified) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.badRequest.humanMessage,
            true,
            httpStatus.clientError.badRequest.code,
        );
    }

    try {
        await rateLimit.resendCode(user.id);
    } catch {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.tooManyRequests.humanMessage,
            true,
            httpStatus.clientError.tooManyRequests.code,
        );
    }

    await deleteAllByUserId(user.id);
    const code = await generateEmailVerificationCode(user.id, user.email);
    try {
        await sendEmailVerificationCode(user.email, code);
    } catch (error) {
        await errorHandler.handleError(error as Error);
        throw new AppError(
            'HttpError',
            httpStatus.serverError.internalServerError.humanMessage,
            true,
            httpStatus.serverError.internalServerError.code,
        );
    }
    return {
        email: user.email,
    };
});
