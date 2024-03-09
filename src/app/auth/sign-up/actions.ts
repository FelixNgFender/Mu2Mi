'use server';

import { siteConfig } from '@/config/site';
import { auth } from '@/lib/auth';
import { sendEmailVerificationCode } from '@/lib/email';
import { AppError, errorHandler } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { action } from '@/lib/safe-action';
import { generateEmailVerificationCode } from '@/lib/token';
import { createOne, findOneByEmail } from '@/models/user';
import { generateId } from 'lucia';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';

import { signUpFormSchema } from './schemas';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const signUpSchema = signUpFormSchema
    .superRefine(async ({}, ctx) => {
        try {
            await rateLimit.signUp();
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Too many requests',
                path: ['email'],
                fatal: true,
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Too many requests',
                path: ['password'],
                fatal: true,
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Too many requests',
                path: ['confirmPassword'],
                fatal: true,
            });
            return z.NEVER;
        }
    })
    .refine(
        async ({ email }) => {
            const user = await findOneByEmail(email);
            return !user;
        },
        {
            message: 'Email already taken',
            path: ['email'],
        },
    );

export const signUp = action(signUpSchema, async ({ email, password }) => {
    const hashedPassword = await new Argon2id().hash(password);
    const userId = generateId(15);

    await createOne({
        id: userId,
        email,
        emailVerified: false,
        hashedPassword,
    });

    const verificationCode = await generateEmailVerificationCode(userId, email);
    try {
        await sendEmailVerificationCode(email, verificationCode);
    } catch (error) {
        await errorHandler.handleError(error as Error);
        throw new AppError(
            'HttpError',
            httpStatus.serverError.internalServerError.humanMessage,
            true,
            httpStatus.serverError.internalServerError.code,
        );
    }
    const session = await auth.createSession(userId, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    redirect(siteConfig.paths.auth.emailVerification);
});
