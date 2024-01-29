'use server';

import { sendPasswordResetLink } from '@/lib/email';
import { generatePasswordResetToken } from '@/lib/token';
import { userModel } from '@/models/user';
import { ActionResult } from '@/types/server-action';
import { z } from 'zod';

export const requestPasswordReset = async (
    data: PasswordResetSchemaClientType,
): Promise<ActionResult> => {
    const { email } = data;

    const result = await passwordResetSchemaServer.safeParseAsync({
        email,
    });

    if (!result.success) {
        return {
            success: false,
            error: JSON.stringify(result.error.issues),
        };
    }

    const user = await userModel.findOneByEmail(email.toLowerCase());
    if (!user || !user.emailVerified) {
        return {
            success: false,
            error: 'Invalid email address',
        };
    }

    const verificationToken = await generatePasswordResetToken(user.id);
    await sendPasswordResetLink(email, verificationToken);
    return {
        success: true,
    };
};

/**
 * Duplicate because Server Actions cannot serialize Zod schemas so no
 * import/export is allowed.
 */
const passwordResetSchemaClient = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
});

type PasswordResetSchemaClientType = z.infer<typeof passwordResetSchemaClient>;

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
const passwordResetSchemaServer = passwordResetSchemaClient.refine(
    async ({ email }) => {
        const user = await userModel.findOneByEmail(email);
        return !!user;
    },
    {
        message: 'Invalid email address',
        path: ['email'],
    },
);

type PasswordResetSchemaServerType = z.infer<typeof passwordResetSchemaServer>;
