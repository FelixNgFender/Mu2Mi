'use server';

import { auth } from '@/lib/auth';
import { passwordResetModel } from '@/models/password-reset';
import { userModel } from '@/models/user';
import { ActionResult } from '@/types/server-action';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isWithinExpirationDate } from 'oslo';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';

export const setNewPassword = async (
    data: NewPasswordSchemaClientType,
    token: string,
): Promise<ActionResult> => {
    const { password, confirmPassword } = data;
    const result = await newPasswordSchemaServer.safeParseAsync({
        password,
        confirmPassword,
    });

    if (!result.success) {
        return {
            success: false,
            error: JSON.stringify(result.error.issues),
        };
    }

    const storedToken = await passwordResetModel.validateAndDelete(token);

    if (!storedToken || !isWithinExpirationDate(storedToken.expiresAt)) {
        return {
            success: false,
            error: 'Invalid token',
        };
    }
    const user = await userModel.findOne(storedToken.userId);
    if (!user) {
        return {
            success: false,
            error: 'Invalid token',
        };
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
};

/**
 * Duplicate because Server Actions cannot serialize Zod schemas so no
 * import/export is allowed.
 */
const newPasswordSchemaClient = z
    .object({
        password: z
            .string()
            .min(8, {
                message: 'Password must be at least 8 characters long',
            })
            .max(64, {
                message: 'Password must be at most 64 characters long',
            }),
        confirmPassword: z
            .string()
            .min(8, {
                message: 'Password must be at least 8 characters long',
            })
            .max(64, {
                message: 'Password must be at most 64 characters long',
            }),
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .superRefine(({ password }, ctx) => {
        const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
        const containsLowercase = (ch: string) => /[a-z]/.test(ch);
        const containsSpecialChar = (ch: string) =>
            /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
        let countOfUpperCase = 0,
            countOfLowerCase = 0,
            countOfNumbers = 0,
            countOfSpecialChar = 0;

        for (let i = 0; i < password.length; i++) {
            let ch = password.charAt(i);
            if (!isNaN(+ch)) countOfNumbers++;
            else if (containsUppercase(ch)) countOfUpperCase++;
            else if (containsLowercase(ch)) countOfLowerCase++;
            else if (containsSpecialChar(ch)) countOfSpecialChar++;
        }

        let errObj = {
            upperCase: {
                pass: true,
                message:
                    'Password must contain at least one uppercase character.',
            },
            lowerCase: {
                pass: true,
                message:
                    'Password must contain at least one lowercase character.',
            },
            specialCh: {
                pass: true,
                message:
                    'Password must contain at least one special character.',
            },
            totalNumber: {
                pass: true,
                message:
                    'Password must contain at least one numeric character.',
            },
        };

        if (countOfLowerCase < 1) {
            errObj = {
                ...errObj,
                lowerCase: { ...errObj.lowerCase, pass: false },
            };
        }
        if (countOfNumbers < 1) {
            errObj = {
                ...errObj,
                totalNumber: { ...errObj.totalNumber, pass: false },
            };
        }
        if (countOfUpperCase < 1) {
            errObj = {
                ...errObj,
                upperCase: { ...errObj.upperCase, pass: false },
            };
        }
        if (countOfSpecialChar < 1) {
            errObj = {
                ...errObj,
                specialCh: { ...errObj.specialCh, pass: false },
            };
        }

        if (
            countOfLowerCase < 1 ||
            countOfUpperCase < 1 ||
            countOfSpecialChar < 1 ||
            countOfNumbers < 1
        ) {
            for (let key in errObj) {
                if (!errObj[key as keyof typeof errObj].pass) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['password'],
                        message: errObj[key as keyof typeof errObj].message,
                    });
                }
            }
        }
    });

type NewPasswordSchemaClientType = z.infer<typeof newPasswordSchemaClient>;

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const newPasswordSchemaServer = newPasswordSchemaClient;

type NewPasswordSchemaServerType = z.infer<typeof newPasswordSchemaServer>;
