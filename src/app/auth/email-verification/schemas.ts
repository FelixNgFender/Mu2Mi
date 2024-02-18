import { z } from 'zod';

export const verifyCodeFormSchema = z.object({
    code: z
        .string()
        .min(6, {
            message: 'Code must be 6 characters long',
        })
        .max(6, {
            message: 'Code must be 6 characters long',
        })
        .regex(/^[0-9]+$/, {
            message: 'Code must contain only numbers',
        }),
});
