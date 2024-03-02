import { withErrorHandling } from '@/lib/error';
import { TrackSeparationWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = withErrorHandling(async (req: Request) => {
    return await replicateWebhookHandler<TrackSeparationWebhookBody>(
        req,
        'trackSeparationStatus',
    );
});
