'use server';

import { sendPasswordResetLink } from '@/lib/email';
import { AppError, errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { action } from '@/lib/safe-action';
import { generatePasswordResetToken } from '@/lib/token';
import { findOneByEmail } from '@/models/user';
import { z } from 'zod';

import { passwordResetFormSchema } from './schemas';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const passwordResetSchema = passwordResetFormSchema
    .superRefine(async ({}, ctx) => {
        try {
            await rateLimit.passwordReset();
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Too many requests',
                path: ['email'],
                fatal: true,
            });
            return z.NEVER;
        }
    })
    .refine(
        async ({ email }) => {
            const user = await findOneByEmail(email);
            return !!user;
        },
        {
            message: 'Invalid email address',
            path: ['email'],
        },
    );

export const requestPasswordReset = action(
    passwordResetSchema,
    async ({ email }) => {
        const user = await findOneByEmail(email.toLowerCase());
        if (!user || !user.emailVerified) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.badRequest.humanMessage,
                true,
                httpStatus.clientError.badRequest.code,
            );
        }

        const verificationToken = await generatePasswordResetToken(user.id);
        try {
            await sendPasswordResetLink(email, verificationToken);
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
    },
);
