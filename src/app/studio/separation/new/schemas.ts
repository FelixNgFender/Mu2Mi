import { trackSeparationAssetConfig } from '@/config/asset';
import { z } from 'zod';

export const trackSeparationModels = [
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

type TrackSeparationModelName = (typeof trackSeparationModels)[number]['name'];

export const separationFormSchema = z.object({
    file: z
        .any()
        .refine(
            (files) => {
                return (
                    files?.[0]?.size <=
                    trackSeparationAssetConfig.maxFileSizeBytes
                );
            },
            `Max file size is ${
                trackSeparationAssetConfig.maxFileSizeBytes / 1024 / 1024
            } MB.`,
        )
        .refine(
            (files) =>
                trackSeparationAssetConfig.allowedMimeTypes.includes(
                    files?.[0]?.type,
                ),
            `Only ${trackSeparationAssetConfig.allowedFileTypes
                .map((type) => type.toUpperCase())
                .join(', ')} files are allowed.`,
        )
        .transform((files) => files?.[0]),
    model_name: z
        .enum([
            'htdemucs',
            'htdemucs_ft',
            'htdemucs_6s',
            'hdemucs_mmi',
            'mdx',
            'mdx_extra',
            'mdx_q',
            'mdx_extra_q',
        ])
        .default('htdemucs'),
    stem: z
        .enum(['vocals', 'bass', 'drums', 'guitar', 'piano', 'other'])
        .optional(),
    clip_mode: z.enum(['rescale', 'clamp']).default('rescale'),
    shifts: z.number().int().min(1).max(10).default(1),
    overlap: z.number().default(0.25),
    output_format: z.enum(['mp3', 'wav', 'flac']).default('mp3'),
    mp3_bitrate: z.number().int().default(320),
    float32: z.boolean().default(false),
});

export type SeparationFormType = z.infer<typeof separationFormSchema>;
