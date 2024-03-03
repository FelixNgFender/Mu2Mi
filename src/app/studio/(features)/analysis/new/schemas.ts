import { trackAnalysisAssetConfig } from '@/config/asset';
import { z } from 'zod';

export const trackAnalysisModels = [
    'harmonix-all',
    'harmonix-fold0',
    'harmonix-fold1',
    'harmonix-fold2',
    'harmonix-fold3',
    'harmonix-fold4',
    'harmonix-fold5',
    'harmonix-fold6',
    'harmonix-fold7',
] as const;

export const analysisFormSchema = z.object({
    file: z
        .any()
        .refine(
            (files) => {
                return (
                    files?.[0]?.size <=
                    trackAnalysisAssetConfig.maxFileSizeBytes
                );
            },
            `Max file size is ${
                trackAnalysisAssetConfig.maxFileSizeBytes / 1024 / 1024
            } MB.`,
        )
        .refine(
            (files) =>
                trackAnalysisAssetConfig.allowedMimeTypes.includes(
                    files?.[0]?.type,
                ),
            `Only ${trackAnalysisAssetConfig.allowedFileTypes
                .map((type) => type.toUpperCase())
                .join(', ')} files are allowed.`,
        )
        .transform((files) => files?.[0]),
    visualize: z.boolean().default(false),
    sonify: z.boolean().default(false),
    activ: z.boolean().default(false),
    embed: z.boolean().default(false),
    model: z.enum(trackAnalysisModels).default('harmonix-all'),
    include_activations: z.boolean().default(false),
    include_embeddings: z.boolean().default(false),
});

export type AnalysisFormType = z.infer<typeof analysisFormSchema>;
