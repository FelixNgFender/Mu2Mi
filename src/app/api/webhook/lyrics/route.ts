import { withErrorHandling } from '@/lib/error';
import { LyricsTranscriptionWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = withErrorHandling(async (req: Request) => {
    return await replicateWebhookHandler<LyricsTranscriptionWebhookBody>(
        req,
        'lyricsTranscriptionStatus',
        'lyrics',
    );
});
