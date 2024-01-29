import { mimeType } from '@/db/schema';

export const assetConfig = {
    maxFileSize: 1024 * 1024 * 10, // 50 MB
    allowedFileTypes: mimeType.enumValues,
};

export type AssetConfig = typeof assetConfig;
