'use server';

import { siteConfig } from '@/config/site';
import { auth } from '@/lib/auth';
import { sendEmailVerificationCode } from '@/lib/email';
import { action } from '@/lib/safe-action';
import { generateEmailVerificationCode } from '@/lib/token';
import { createOne, findOneByEmail } from '@/models/user';
import { generateId } from 'lucia';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Argon2id } from 'oslo/password';

import { signUpFormSchema } from './schemas';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const signUpSchema = signUpFormSchema.refine(
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
        username: email,
        usernameLower: email.toLowerCase(),
    });

    const verificationCode = await generateEmailVerificationCode(userId, email);
    await sendEmailVerificationCode(email, verificationCode);

    const session = await auth.createSession(userId, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    redirect(siteConfig.paths.auth.emailVerification);
});
