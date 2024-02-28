import { styleRemixAssetConfig } from '@/config/asset';
import { z } from 'zod';

export const styleRemixModels = [
    {
        name: 'chord',
    },
    {
        name: 'chord-large',
    },
    {
        name: 'stereo-chord',
    },
    {
        name: 'stereo-chord-large',
    },
] as const;

export const styleRemixFormSchema = z.object({
    file: z
        .any()
        .refine(
            (files) => {
                return (
                    files?.[0]?.size <= styleRemixAssetConfig.maxFileSizeBytes
                );
            },
            `Max file size is ${
                styleRemixAssetConfig.maxFileSizeBytes / 1024 / 1024
            } MB.`,
        )
        .refine(
            (files) =>
                styleRemixAssetConfig.allowedMimeTypes.includes(
                    files?.[0]?.type,
                ),
            `Only ${styleRemixAssetConfig.allowedFileTypes
                .map((type) => type.toUpperCase())
                .join(', ')} files are allowed.`,
        )
        .transform((files) => files?.[0]),
    model_version: z
        .enum(['chord', 'chord-large', 'stereo-chord', 'stereo-chord-large'])
        .default('stereo-chord'),
    prompt: z.string(),
    multi_band_diffusion: z.boolean().optional(),
    normalization_strategy: z
        .enum(['loudness', 'clip', 'peak', 'rms'])
        .default('loudness'),
    beat_sync_threshold: z.number().optional().default(0.75),
    large_chord_voca: z.boolean().default(true),
    chroma_coefficient: z.number().int().min(0.5).max(2).default(1),
    top_k: z.number().int().optional().default(250),
    top_p: z.number().optional().default(0),
    temperature: z.number().optional().default(1),
    classifier_free_guidance: z.number().int().optional().default(3),
    output_format: z.enum(['mp3', 'wav']).default('wav'),
    return_instrumental: z.boolean().optional(),
    seed: z.number().int().optional(),
});

export type StyleRemixFormType = z.infer<typeof styleRemixFormSchema>;
