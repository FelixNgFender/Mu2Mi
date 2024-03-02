import { withErrorHandling } from '@/lib/error';
import { StyleRemixWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = withErrorHandling(async (req: Request) => {
    return await replicateWebhookHandler<StyleRemixWebhookBody>(
        req,
        'styleRemixStatus',
        'remix',
    );
});
