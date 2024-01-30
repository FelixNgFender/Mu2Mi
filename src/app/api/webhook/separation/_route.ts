import { env } from '@/config/env';
import { HttpResponse } from '@/lib/response';
import { z } from 'zod';

export const webhookSchema = z.object({
    taskId: z.string(),
    secret: z.string().refine((data) => data === env.WEBHOOK_SECRET, {
        message: 'Invalid secret',
    }),
});

export const POST = async (req: Request) => {
    const searchParams = new URL(req.url).searchParams;
    const parsedParams = webhookSchema.safeParse(
        Object.fromEntries(searchParams),
    );

    if (!parsedParams.success) {
        return HttpResponse.badRequest(parsedParams.error.format());
    }

    const { taskId } = parsedParams.data;
    let body: any; // TODO: type this, either manually or getting replicate openapi.json
    try {
        body = await req.json();
    } catch {
        return HttpResponse.badRequest('Invalid JSON body');
    }

    const { output, error } = body;

    if (error) {
        return HttpResponse.badRequest(error.message);
    }
};

const replicateWebhookSchemaServer = z.object({
    id: z.string().length(7).or(z.string().length(10)),
    secret: z.string().refine((data) => data === env.WEBHOOK_SECRET, {
        message: 'Invalid secret',
    }),
});
