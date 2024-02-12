import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { MusicGenWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = async (req: Request) => {
    try {
        await replicateWebhookHandler<MusicGenWebhookBody>(
            req,
            'musicgenStatus',
            'musicgen',
        );
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};
