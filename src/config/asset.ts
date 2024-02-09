export const assetConfig = {
    maxFileSize: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: [
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/flac',
        'audio/mp4',
        'audio/mov',
        'audio/wma',
    ],
} as const;
