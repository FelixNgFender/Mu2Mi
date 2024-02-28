import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { StyleRemixWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = async (req: Request) => {
    try {
        return await replicateWebhookHandler<StyleRemixWebhookBody>(
            req,
            'styleRemixStatus',
            'remix',
        );
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};
