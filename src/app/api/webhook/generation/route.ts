import { withErrorHandling } from '@/lib/error';
import { MusicGenerationWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = withErrorHandling(async (req: Request) => {
    return await replicateWebhookHandler<MusicGenerationWebhookBody>(
        req,
        'musicGenerationStatus',
        'generation',
    );
});
