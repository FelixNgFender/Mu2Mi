import { z } from 'zod';

export const passwordResetFormSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
});

export type PasswordResetFormType = z.infer<typeof passwordResetFormSchema>;
