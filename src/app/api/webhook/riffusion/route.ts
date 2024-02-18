import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { RiffusionWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = async (req: Request) => {
    try {
        return await replicateWebhookHandler<RiffusionWebhookBody>(
            req,
            'riffusionStatus',
            'riffusion',
        );
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};
