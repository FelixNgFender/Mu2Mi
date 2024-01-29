import { z } from 'zod';

export const MAX_LOCAL_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ACCEPTED_LOCAL_FILE_TYPES = {
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/flac': 'flac',
    'audio/mp4': 'mp4',
    'audio/mov': 'mov',
    'audio/wma': 'wma',
} as const;

export type Model = {
    name: string;
    description: string;
};

export const models: Model[] = [
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
];

export const TrackSeparationModelInputSchema = z.object({
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

export const SeparationFormSchema = TrackSeparationModelInputSchema.omit({
    audio: true,
});

export type SeparationFormSchemaType = z.infer<typeof SeparationFormSchema>;
