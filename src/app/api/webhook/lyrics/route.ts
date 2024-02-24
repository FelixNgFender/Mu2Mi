import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { LyricsTranscriptionWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = async (req: Request) => {
    try {
        return await replicateWebhookHandler<LyricsTranscriptionWebhookBody>(
            req,
            'lyricsTranscriptionStatus',
            'lyrics',
        );
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};
