import { analysisFormSchema } from '@/app/studio/analysis/new/schemas';
import { separationFormSchema } from '@/app/studio/separation/new/schemas';
import { z } from 'zod';

export const webhookMetadataSchema = z.object({
    taskId: z.string().min(15).max(15), // = track id
    userId: z.string().min(15).max(15),
});

export const trackSeparationInputSchema = separationFormSchema
    .omit({
        file: true,
    })
    .extend({
        audio: z.string().url(),
    });

const trackSeparationSchema = trackSeparationInputSchema.merge(
    webhookMetadataSchema,
);

export type TrackSeparationSchemaType = z.infer<typeof trackSeparationSchema>;

export const trackAnalysisInputSchema = analysisFormSchema
    .omit({
        file: true,
    })
    .extend({
        music_input: z.string().url(),
    });

const trackAnalysisSchema = trackAnalysisInputSchema.merge(
    webhookMetadataSchema,
);

export type TrackAnalysisSchemaType = z.infer<typeof trackAnalysisSchema>;

export const midiTranscriptionInputSchema = z.object({
    audio_file: z.string().url(),
});

const midiTranscriptionSchema = midiTranscriptionInputSchema.merge(
    webhookMetadataSchema,
);

export type MidiTranscriptionSchemaType = z.infer<
    typeof midiTranscriptionSchema
>;

export const musicgenInputSchema = z.object({
    model_version: z
        .enum([
            'stereo-melody-large',
            'stereo-large',
            'melody-large',
            'large',
            'encode-decode',
        ])
        .default('stereo-melody-large'),
    prompt: z.string(),
    input_audio: z.string().url().optional(),
    duration: z.number().int().min(1).max(60).default(8),
    continuation: z.boolean().optional(),
    continuation_start: z.number().int().min(0).optional(),
    continuation_end: z.number().int().min(0).optional(),
    multi_band_diffusion: z.boolean().optional(),
    normalization_strategy: z
        .enum(['loudness', 'clip', 'peak', 'rms'])
        .default('loudness'),
    top_k: z.number().int().optional().default(250),
    top_p: z.number().optional().default(0),
    temperature: z.number().optional().default(1),
    classifier_free_guidance: z.number().int().optional().default(3),
    output_format: z.enum(['mp3', 'wav']).default('wav'),
    seed: z.number().int().optional(),
});

const musicgenSchema = musicgenInputSchema.merge(webhookMetadataSchema);

export type MusicgenSchemaType = z.infer<typeof musicgenSchema>;

interface ReplicateWebhookBody {
    status: 'starting' | 'succeeded' | 'failed' | 'canceled';
    error: string | null;
    output: any;
}

export interface TrackSeparationWebhookBody extends ReplicateWebhookBody {
    output: {
        bass: string | null;
        drums: string | null;
        other: string | null;
        piano: string | null;
        guitar: string | null;
        vocals: string | null;
    };
}

export interface TrackAnalysisWebhookBody extends ReplicateWebhookBody {
    output: [string | null, string | null, string | null];
}

export interface MidiTranscriptionWebhookBody extends ReplicateWebhookBody {
    output: string | null;
}

export interface MusicGenWebhookBody extends ReplicateWebhookBody {
    output: string | null;
}

export type ReplicateWebhookBodyTypes =
    | TrackSeparationWebhookBody
    | TrackAnalysisWebhookBody
    | MidiTranscriptionWebhookBody
    | MusicGenWebhookBody;
