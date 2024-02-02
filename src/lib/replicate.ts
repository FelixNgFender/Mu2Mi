import { env } from '@/config/env';
import { models } from '@/types/replicate';
import Replicate from 'replicate';
import 'server-only';
import { z } from 'zod';

export class ReplicateClient {
    replicate: Replicate;

    constructor({ auth }: { auth: string }) {
        this.replicate = new Replicate({ auth });

        // 🫠 - https://github.com/replicate/replicate-javascript/issues/136
        // Alternatively, opt out of caching in your component with noStore
        // https://github.com/replicate/replicate-javascript/issues/136#issuecomment-1847442879
        this.replicate.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
            fetch(input, { ...init, cache: 'no-store' });
    }

    async separateTrack({
        taskId,
        userId,
        ...data
    }: TrackSeparationSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/separation`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        webhook.searchParams.set('secret', env.WEBHOOK_SECRET);
        console.log('data before going into replicate', data);
        return this.replicate.predictions.create({
            version: env.TRACK_SEPARATION_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            // start: immmediately on prediction start
            // completed: when the prediction reaches a terminal state (succeeded/canceled/failed)
            webhook_events_filter: ['completed'],
        });
    }
}

export const replicateClient = new ReplicateClient({
    auth: env.REPLICATE_API_TOKEN,
});

export const trackSeparationInputSchema = z.object({
    audio: z.string().url(),
    model_name: z
        .enum([...models.map((model) => model.name)] as [string, ...string[]])
        .default('htdemucs'),
    stem: z
        .enum(['vocals', 'bass', 'drums', 'guitar', 'piano', 'other'])
        .optional(),
    clip_mode: z.enum(['rescale', 'clamp']).default('rescale'),
    shifts: z.number().int().min(1).max(10).default(1),
    overlap: z.number().default(0.25),
    mp3_bitrate: z.number().int().default(320),
    float32: z.boolean().default(false),
    output_format: z.enum(['mp3', 'wav', 'flac']).default('mp3'),
});

export const webhookMetadataSchema = z.object({
    taskId: z.string().min(15).max(15), // = track id
    userId: z.string().min(15).max(15),
    secret: z.string().refine((data) => data === env.WEBHOOK_SECRET, {
        message: 'Invalid secret',
    }),
});

const trackSeparationSchema = trackSeparationInputSchema
    .merge(webhookMetadataSchema)
    .omit({
        secret: true,
    });

type TrackSeparationSchemaType = z.infer<typeof trackSeparationSchema>;
