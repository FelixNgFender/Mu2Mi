import { signUpSchemaClient } from '@/src/app/_schemas/client/sign-up';
import { db } from '@/src/app/_server/db';
import { user as userTable } from '@/src/app/_server/schema';
import { eq } from 'drizzle-orm';
import * as z from 'zod';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
export const signUpSchemaServer = signUpSchemaClient.refine(
    async ({ email }) => {
        const [user] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email.toLowerCase()));
        return !user;
    },
    {
        message: 'Email already taken',
        path: ['email'],
    },
);

export type signUpSchemaServerType = z.infer<typeof signUpSchemaServer>;
