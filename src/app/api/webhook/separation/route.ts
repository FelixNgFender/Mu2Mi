import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { TrackSeparationWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = async (req: Request) => {
    try {
        await replicateWebhookHandler<TrackSeparationWebhookBody>(
            req,
            'trackSeparationStatus',
        );
    } catch (error) {
        errorHandler.handleError(error as Error);
        return HttpResponse.internalServerError();
    }
};
