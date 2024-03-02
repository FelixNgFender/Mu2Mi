import { withErrorHandling } from '@/lib/error';
import { MidiTranscriptionWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = withErrorHandling(async (req: Request) => {
    return await replicateWebhookHandler<MidiTranscriptionWebhookBody>(
        req,
        'midiTranscriptionStatus',
        'midi',
    );
});
