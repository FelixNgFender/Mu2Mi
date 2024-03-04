import { z } from 'zod';

export const userFormSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: 'Username must be at least 2 characters.',
        })
        .max(20, {
            message: 'Username must be at most 20 characters.',
        }),
});

export type UserFormType = z.infer<typeof userFormSchema>;
