import { separationFormSchema } from '@/app/studio/separation/new/schemas';
import { env } from '@/config/env';
import { z } from 'zod';

export const webhookMetadataSchema = z.object({
    taskId: z.string().min(15).max(15), // = track id
    userId: z.string().min(15).max(15),
    secret: z.string().refine((data) => data === env.WEBHOOK_SECRET, {
        message: 'Invalid secret',
    }),
});

export const trackSeparationInputSchema = separationFormSchema
    .omit({
        file: true,
    })
    .extend({
        audio: z.string().url(),
    });

const trackSeparationSchema = trackSeparationInputSchema
    .merge(webhookMetadataSchema)
    .omit({
        secret: true,
    });

export type TrackSeparationSchemaType = z.infer<typeof trackSeparationSchema>;

export const midiTranscriptionInputSchema = z.object({
    audio_file: z.string().url(),
});

const midiTranscriptionSchema = midiTranscriptionInputSchema
    .merge(webhookMetadataSchema)
    .omit({
        secret: true,
    });

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

const musicgenSchema = musicgenInputSchema.merge(webhookMetadataSchema).omit({
    secret: true,
});

export type MusicgenSchemaType = z.infer<typeof musicgenSchema>;

export const riffusionInputSchema = z.object({
    prompt_a: z.string().default('funky synth solo'),
    denoising: z.number().min(0).max(1).default(0.75),
    prompt_b: z.string().optional(),
    alpha: z.number().min(0).max(1).default(0.5),
    num_inference_steps: z.number().int().min(1).default(50),
    seed_image_id: z
        .enum([
            'agile',
            'marim',
            'mask_beat_lines_80',
            'mask_gradient_dark',
            'mask_gradient_top_70',
            'mask_graident_top_fifth_75',
            'mask_top_third_75',
            'mask_top_third_95',
            'motorway',
            'og_beat',
            'vibes',
        ])
        .default('vibes'),
});

const riffusionSchema = riffusionInputSchema.merge(webhookMetadataSchema).omit({
    secret: true,
});

export type RiffusionSchemaType = z.infer<typeof riffusionSchema>;

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

export interface MidiTranscriptionWebhookBody extends ReplicateWebhookBody {
    output: string | null;
}

export interface MusicGenWebhookBody extends ReplicateWebhookBody {
    output: string | null;
}

export interface RiffusionWebhookBody extends ReplicateWebhookBody {
    output: {
        audio: string | null;
        spectrogram: string | null;
    };
}

export type ReplicateWebhookBodyTypes =
    | TrackSeparationWebhookBody
    | MidiTranscriptionWebhookBody
    | MusicGenWebhookBody
    | RiffusionWebhookBody;
