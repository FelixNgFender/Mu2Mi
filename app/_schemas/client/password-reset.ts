import * as z from 'zod';

/**
 * For **client-side** validation
 */
export const passwordResetSchemaClient = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
});

export type passwordResetSchemaClientType = z.infer<
    typeof passwordResetSchemaClient
>;
