import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { MidiTranscriptionWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = async (req: Request) => {
    try {
        return await replicateWebhookHandler<MidiTranscriptionWebhookBody>(
            req,
            'midiTranscriptionStatus',
            'midi',
        );
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};
