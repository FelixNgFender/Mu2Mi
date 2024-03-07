import { rateLimit } from '@/lib/rate-limit';
import { authAction } from '@/lib/safe-action';
import { z } from 'zod';

const getUserCreditsSchema = z.object({});

export const getUserCredits = authAction(
    getUserCreditsSchema,
    async ({}, { user }) => await rateLimit.getUserCredits(user.id),
);
