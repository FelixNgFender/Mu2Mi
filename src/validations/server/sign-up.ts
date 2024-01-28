import { userModel } from '@/models/user';
import { signUpSchemaClient } from '@/validations/client/sign-up';
import 'server-cli-only';
import * as z from 'zod';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
export const signUpSchemaServer = signUpSchemaClient.refine(
    async ({ email }) => {
        const user = await userModel.findOneByEmail(email);
        return !user;
    },
    {
        message: 'Email already taken',
        path: ['email'],
    },
);

export type SignUpSchemaServerType = z.infer<typeof signUpSchemaServer>;
