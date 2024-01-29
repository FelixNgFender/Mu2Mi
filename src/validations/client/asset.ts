import { assetConfig } from '@/config/asset';
import { z } from 'zod';

/**
 * For client-side validation.
 */
export const signedUrlBodySchemaClient = z.object({
    type: z.enum(assetConfig.allowedFileTypes),
    size: z.number().max(assetConfig.maxFileSize),
    checksum: z.string(),
});

export type SignedUrlBodySchemaClientType = z.infer<
    typeof signedUrlBodySchemaClient
>;
