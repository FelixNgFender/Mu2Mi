'use server';

import { sendPasswordResetLink } from '@/lib/email';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { action } from '@/lib/safe-action';
import { generatePasswordResetToken } from '@/lib/token';
import { findOneByEmail } from '@/models/user';

import { passwordResetFormSchema } from './schemas';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const passwordResetSchema = passwordResetFormSchema.refine(
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
        await sendPasswordResetLink(email, verificationToken);
        return {
            email: user.email,
        };
    },
);
