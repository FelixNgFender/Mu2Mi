import { env } from '@/config/env';
import { z } from 'zod';

const models = [
    {
        name: 'htdemucs',
        description:
            'First version of Hybrid Transformer Demucs. Trained on MusDB + 800 songs. Default model.',
    },
    {
        name: 'htdemucs_ft',
        description:
            'Fine-tuned version of htdemucs, separation will take 4 times more time but might be a bit better. Same training set as htdemucs.',
    },
    {
        name: 'htdemucs_6s',
        description:
            '6 sources version of htdemucs, with piano and guitar being added as sources. Note that the piano source is not working great at the moment.',
    },
    {
        name: 'hdemucs_mmi',
        description: 'Hybrid Demucs v3, retrained on MusDB + 800 songs.',
    },
    {
        name: 'mdx',
        description:
            'Trained only on MusDB HQ, winning model on track A at the MDX challenge.',
    },
    {
        name: 'mdx_extra',
        description:
            'Trained with extra training data (including MusDB test set), ranked 2nd on the track B of the MDX challenge.',
    },
    {
        name: 'mdx_q',
        description:
            'Quantized version of the previous models. Smaller download and storage but quality can be slightly worse.',
    },
    {
        name: 'mdx_extra_q',
        description:
            'Quantized version of the previous models. Smaller download and storage but quality can be slightly worse.',
    },
] as const;

export const webhookMetadataSchema = z.object({
    taskId: z.string().min(15).max(15), // = track id
    userId: z.string().min(15).max(15),
    secret: z.string().refine((data) => data === env.WEBHOOK_SECRET, {
        message: 'Invalid secret',
    }),
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

const trackSeparationSchema = trackSeparationInputSchema
    .merge(webhookMetadataSchema)
    .omit({
        secret: true,
    });

export type TrackSeparationSchemaType = z.infer<typeof trackSeparationSchema>;

const smartMetronomeInputSchema = z.object({
    audio: z.string().url(),
    click_track: z.boolean().default(true),
    combine_click_track: z.boolean().default(true),
    detect_downbeat: z.boolean().default(false),
});

const smartMetronomeSchema = smartMetronomeInputSchema
    .merge(webhookMetadataSchema)
    .omit({
        secret: true,
    });

export type SmartMetronomeSchemaType = z.infer<typeof smartMetronomeSchema>;

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

export interface SmartMetronomeWebhookBody extends ReplicateWebhookBody {
    output: {
        beats: string | null;
        click: string | null;
        combined: string | null;
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
