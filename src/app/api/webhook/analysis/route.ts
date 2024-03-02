import { withErrorHandling } from '@/lib/error';
import { TrackAnalysisWebhookBody } from '@/types/replicate';

import { replicateWebhookHandler } from '../replicate';

export const POST = withErrorHandling(async (req: Request) => {
    return await replicateWebhookHandler<TrackAnalysisWebhookBody>(
        req,
        'trackAnalysisStatus',
    );
});
