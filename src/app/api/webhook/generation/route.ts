import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { MusicGenerationWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = async (req: Request) => {
    try {
        return await replicateWebhookHandler<MusicGenerationWebhookBody>(
            req,
            'musicGenerationStatus',
            'generation',
        );
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};
