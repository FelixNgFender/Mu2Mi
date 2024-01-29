'use server';

import { auth, getUserSession } from '@/lib/auth';
import { sendEmailVerificationCode } from '@/lib/email';
import { errorHandler } from '@/lib/error';
import { generateEmailVerificationCode } from '@/lib/token';
import { emailVerificationModel } from '@/models/email-verification';
import { userModel } from '@/models/user';
import { ActionResult } from '@/types/server-action';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isWithinExpirationDate } from 'oslo';
import { z } from 'zod';

export const verifyCode = async (code: string): Promise<ActionResult> => {
    const { user } = await getUserSession();
    if (!user) {
        return {
            success: false,
            error: 'Sorry, you need to be signed in to do that',
        };
    }
    if (user.emailVerified) {
        return {
            success: false,
            error: 'Your email is already verified',
        };
    }

    const result = emailVerificationSchemaClient.safeParse({
        code,
    });

    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0]?.message ?? 'Invalid code',
        };
    }

    const databaseCode = await emailVerificationModel.validateAndDelete(
        user.id,
    );
    if (!databaseCode || databaseCode.code !== code) {
        return {
            success: false,
            error: 'Invalid code',
        };
    }
    if (!isWithinExpirationDate(databaseCode.expiresAt)) {
        return {
            success: false,
            error: 'Expired code',
        };
    }
    if (user.email !== databaseCode.email) {
        return {
            success: false,
            error: 'Invalid code',
        };
    }

    await auth.invalidateUserSessions(user.id);
    await userModel.updateOne(user.id, {
        emailVerified: true,
    });

    const session = await auth.createSession(user.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    redirect('/');
};

export const resendCode = async (): Promise<ActionResult> => {
    const { user } = await getUserSession();
    if (!user) {
        return {
            success: false,
            error: 'Sorry, you need to be signed in to do that',
        };
    }
    if (user.emailVerified) {
        return {
            success: false,
            error: 'Your email is already verified',
        };
    }

    try {
        await emailVerificationModel.deleteAllByUserId(user.id);
        const code = await generateEmailVerificationCode(user.id, user.email);
        await sendEmailVerificationCode(user.email, code);
        return {
            success: true,
        };
    } catch (err) {
        await errorHandler.handleError(err as Error);
        return {
            success: false,
            error: (err as Error).message,
        };
    }
};

/**
 * Duplicate because Server Actions cannot serialize Zod schemas so no
 * import/export is allowed.
 */
const emailVerificationSchemaClient = z.object({
    code: z
        .string()
        .min(6, {
            message: 'Code must be 6 characters long',
        })
        .max(6, {
            message: 'Code must be 6 characters long',
        })
        .regex(/^[0-9]+$/, {
            message: 'Code must contain only numbers',
        }),
});
