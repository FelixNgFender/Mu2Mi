'use server';

import { auth } from '@/lib/auth';
import { userModel } from '@/models/user';
import { ActionResult } from '@/types/server-action';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';

export const signIn = async (
    data: SignInSchemaClientType,
): Promise<ActionResult> => {
    const { email, password, rememberMe } = data;

    const result = await signInSchemaServer.safeParseAsync({
        email,
        password,
        rememberMe,
    });

    if (!result.success) {
        return {
            success: false,
            error: JSON.stringify(result.error.issues),
        };
    }

    const existingUser = await userModel.findOneByEmail(email.toLowerCase());
    // We know it's not null because of the validation above
    const session = await auth.createSession(existingUser!.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    redirect('/');
};

/**
 * For **client-side** validation
 */
const signInSchemaClient = z
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
        rememberMe: z.boolean(),
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

type SignInSchemaClientType = z.infer<typeof signInSchemaClient>;

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const signInSchemaServer = signInSchemaClient.superRefine(
    async ({ email, password }, ctx) => {
        try {
            const existingUser = await userModel.findOneByEmail(
                email.toLowerCase(),
            );
            // TODO: in the case of null hashedPassword, it means the user signed
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
