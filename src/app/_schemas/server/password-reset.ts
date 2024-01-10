import { passwordResetSchemaClient } from '@/src/app/_schemas/client/password-reset';
import { db } from '@/src/server/db';
import { user as userTable } from '@/src/server/schema';
import { eq } from 'drizzle-orm';
import * as z from 'zod';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
export const passwordResetSchemaServer = passwordResetSchemaClient.refine(
    async ({ email }) => {
        const [user] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email.toLowerCase()));
        if (user) {
            return true;
        }
        return false;
    },
    {
        message: 'User does not exist',
        path: ['email'],
    },
);

export type passwordResetSchemaServerType = z.infer<
    typeof passwordResetSchemaServer
>;
