import { musicGenerationAssetConfig } from '@/config/asset';
import { z } from 'zod';

export const musicGenerationModels = [
    {
        name: 'large',
        description: '3.3B model, text to music only.',
    },
    {
        name: 'melody-large',
        description: '3.3B model, text to music and text & melody to music.',
    },
    {
        name: 'stereo-large',
        description: "Same as 'large', fine-tuned for stereo generation.",
    },
    {
        name: 'stereo-melody-large',
        description:
            "Same as 'melody-large', fine-tuned for stereo generation.",
    },
    {
        name: 'encode-decode',
        description:
            'The uploaded audio specified will simply be encoded and then decoded.',
    },
];

export const musicGenerationFormSchema = z.object({
    file: z
        .any()
        .optional()
        .refine(
            (files) => {
                if (!files?.[0]) return true;
                return (
                    files?.[0]?.size <=
                    musicGenerationAssetConfig.maxFileSizeBytes
                );
            },
            `Max file size is ${
                musicGenerationAssetConfig.maxFileSizeBytes / 1024 / 1024
            } MB.`,
        )
        .refine(
            (files) => {
                if (!files?.[0]) return true;
                return musicGenerationAssetConfig.allowedMimeTypes.includes(
                    files?.[0]?.type,
                );
            },
            `Only ${musicGenerationAssetConfig.allowedFileTypes
                .map((type) => type.toUpperCase())
                .join(', ')} files are allowed.`,
        )
        .transform((files) => {
            if (!files?.[0]) return null;
            return files?.[0];
        }),
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

export type MusicGenerationFormType = z.infer<typeof musicGenerationFormSchema>;
