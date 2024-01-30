import { mimeType } from '@/db/schema';

export const assetConfig = {
    maxFileSize: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: mimeType.enumValues,
} as const;
