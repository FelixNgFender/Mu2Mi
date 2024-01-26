import { userModel } from '@/models/user';
import { passwordResetSchemaClient } from '@/validations/client/password-reset';
import 'server-cli-only';
import * as z from 'zod';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
export const passwordResetSchemaServer = passwordResetSchemaClient.refine(
    async ({ email }) => {
        const user = await userModel.findOneByEmail(email);
        return !!user;
    },
    {
        message: 'User does not exist',
        path: ['email'],
    },
);

export type passwordResetSchemaServerType = z.infer<
    typeof passwordResetSchemaServer
>;
