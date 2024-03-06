'use server';

import { siteConfig } from '@/config/site';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { action } from '@/lib/safe-action';
import { findOneByEmail } from '@/models/user';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';

import { signInFormSchema } from './schemas';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const signInSchema = signInFormSchema.superRefine(
    async ({ email, password }, ctx) => {
        try {
            await rateLimit.signIn();
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
            return z.NEVER;
        }

        try {
            const existingUser = await findOneByEmail(email.toLowerCase());
            // in the case of null hashedPassword, it means the user signed
            // up with a social account
            if (!existingUser || !existingUser.hashedPassword) {
                throw new Error();
            }
            const validPassword = await new Argon2id().verify(
                existingUser.hashedPassword,
                password,
            );
            if (!validPassword) {
                throw new Error();
            }
        } catch (e) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Incorrect email or password`,
                path: ['email'],
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Incorrect email or password`,
                path: ['password'],
            });
        }
    },
);

export const signIn = action(signInSchema, async ({ email, rememberMe }) => {
    const existingUser = await findOneByEmail(email.toLowerCase());
    // We know it's not null because of the validation above
    const session = await auth.createSession(existingUser!.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    if (!rememberMe) {
        sessionCookie.attributes.expires = undefined;
    }
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    redirect(siteConfig.paths.studio.home);
});
