'use server';

import { auth } from '@/lib/auth';
import { sendEmailVerificationCode } from '@/lib/email';
import { generateEmailVerificationCode } from '@/lib/token';
import { userModel } from '@/models/user';
import { ActionResult } from '@/types/server-action';
import { generateId } from 'lucia';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';

export const signUp = async (
    data: SignUpSchemaClientType,
): Promise<ActionResult> => {
    const { email, password, confirmPassword } = data;

    const result = await signUpSchemaServer.safeParseAsync({
        email,
        password,
        confirmPassword,
    });

    if (!result.success) {
        return {
            success: false,
            error: JSON.stringify(result.error.issues),
        };
    }
    const hashedPassword = await new Argon2id().hash(password);
    const userId = generateId(15);

    await userModel.createOne({
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
    redirect('/auth/email-verification');
};

/**
 * Duplicate because Server Actions cannot serialize Zod schemas so no
 * import/export is allowed.
 */
const signUpSchemaClient = z
    .object({
        email: z.string().email({ message: 'Invalid email address.' }),
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

type SignUpSchemaClientType = z.infer<typeof signUpSchemaClient>;

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const signUpSchemaServer = signUpSchemaClient.refine(
    async ({ email }) => {
        const user = await userModel.findOneByEmail(email);
        return !user;
    },
    {
        message: 'Email already taken',
        path: ['email'],
    },
);
