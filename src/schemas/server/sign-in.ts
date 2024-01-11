import { signInSchemaClient } from '@/src/schemas/client/sign-in';
import { auth } from '@/src/server/auth';
import * as z from 'zod';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
export const signInSchemaServer = signInSchemaClient.superRefine(
    async ({ email, password }, ctx) => {
        try {
            await auth.useKey('email', email.toLowerCase(), password);
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

export type signInSchemaServerType = z.infer<typeof signInSchemaServer>;
