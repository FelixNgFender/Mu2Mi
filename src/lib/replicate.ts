import { TrackSeparationModelInputSchema } from '@/app/studio/(separation)/separation/new/_schemas/changeme';
import { env } from '@/config/env';
import Replicate from 'replicate';
import 'server-cli-only';
import { number } from 'zod';
// input: {
//     stem: "drums",
//     audio: "https://replicate.delivery/pbxt/J6Quo9VPU210JJB9HS97ThWUxT7iax8PWiP7FD5f3bg2G6AY/test1.mp3",
//     shifts: 1,
//     float32: false,
//     overlap: 0.25,
//     clip_mode: "rescale",
//     model_name: "htdemucs",
//     mp3_bitrate: 320,
//     output_format: "mp3"
//   }
import { z } from 'zod';

// {
//     "completed_at": "2023-07-02T13:16:03.793953Z",
//     "created_at": "2023-07-02T13:09:45.628835Z",
//     "error": null,
//     "id": "dc65harbsxzisn5qzyc5ekhfrm",
//     "input": {
//       "audio": "https://replicate.delivery/pbxt/J6Quo9VPU210JJB9HS97ThWUxT7iax8PWiP7FD5f3bg2G6AY/test1.mp3",
//       "shifts": 1,
//       "overlap": 0.25,
//       "clip_mode": "rescale",
//       "model_name": "htdemucs",
//       "mp3_bitrate": 320,
//       "output_format": "mp3"
//     },
//     "logs": "0%|                                                                                   | 0.0/11.7 [00:00<?, ?seconds/s]\n 50%|█████████████████████████████████████                                     | 5.85/11.7 [00:01<00:01,  3.19seconds/s]\n100%|██████████████████████████████████████████████████████████████████████████| 11.7/11.7 [00:02<00:00,  6.59seconds/s]\n100%|██████████████████████████████████████████████████████████████████████████| 11.7/11.7 [00:02<00:00,  5.68seconds/s]",
//     "metrics": {
//       "predict_time": 14.642236
//     },
//     "output": {
//       "bass": "https://replicate.delivery/pbxt/xS2oNA7iL0rzLpKVzafqakkr1fT6p2RdgfWz8hJzpE3jUlXiA/bass.mp3",
//       "drums": "https://replicate.delivery/pbxt/OZduILkg6lYgEd2Dq02z4u0GlZWZxTCjipGp2VBAssokq8SE/drums.mp3",
//       "other": "https://replicate.delivery/pbxt/aoDOOSdliPIzPd7fqCM0MXRH1anPeJp14NcqmUPpCyGTqyLRA/other.mp3",
//       "piano": null,
//       "guitar": null,
//       "vocals": "https://replicate.delivery/pbxt/QmkyLa6ikf0AfUObCIO1M6hEaYVoIekVZdZiwLMRu6aiUlXiA/vocals.mp3"
//     },
//     "started_at": "2023-07-02T13:15:49.151717Z",
//     "status": "succeeded",
//     "urls": {
//       "get": "https://api.replicate.com/v1/predictions/dc65harbsxzisn5qzyc5ekhfrm",
//       "cancel": "https://api.replicate.com/v1/predictions/dc65harbsxzisn5qzyc5ekhfrm/cancel"
//     },
//     "version": "abf8fe28e407afa6d8e41e86a759caccc0af8e49c3c68016006b62cb0968441e"
//   }

const TrackSeparationSchema = TrackSeparationModelInputSchema.extend({
    taskId: z.number().int(),
});

type TrackSeparationSchemaType = z.infer<typeof TrackSeparationSchema>;

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

    async separateTrack({ taskId, ...data }: TrackSeparationSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/separation`);
        webhook.searchParams.set('taskId', taskId.toString());
        webhook.searchParams.set('secret', env.WEBHOOK_SECRET);
        // TODO: Make webhook handlers idempotent. Identical webhooks can be sent
        // more than once, so you’ll need handle potentially duplicate information.

        return this.replicate.predictions.create({
            version: env.TRACK_SEPARATION_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            webhook_events_filter: ['start', 'completed'],
        });
    }
}

export const replicateClient = new ReplicateClient({
    auth: env.REPLICATE_API_TOKEN,
});
