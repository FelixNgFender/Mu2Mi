import { env } from '@/config/env';
import 'server-cli-only';
import { z } from 'zod';

export const replicateWebhookSchemaServer = z.object({
    id: z.string().length(7).or(z.string().length(10)),
    secret: z.string().refine((data) => data === env.WEBHOOK_SECRET, {
        message: 'Invalid secret',
    }),
});
