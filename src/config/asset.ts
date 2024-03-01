import { mimeType } from '@/infra/schema';

export const assetConfig = {
    maxFileSizeBytes: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: mimeType.enumValues,
} as const;

export const musicGenerationAssetConfig = {
    maxFileSizeBytes: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: [
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/flac',
        'audio/m4a',
    ],
    allowedFileTypes: ['mp3', 'ogg', 'wav', 'flac', 'm4a'],
} as const;

export const styleRemixAssetConfig = {
    maxFileSizeBytes: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: [
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/flac',
        'audio/m4a',
    ],
    allowedFileTypes: ['mp3', 'ogg', 'wav', 'flac', 'm4a'],
} as const;

export const trackSeparationAssetConfig = {
    maxFileSizeBytes: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: [
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/flac',
        'audio/mp4',
        'audio/mov',
        'audio/wma',
    ],
    allowedFileTypes: ['mp3', 'wav', 'flac', 'mp4', 'mov', 'wma'],
} as const;

export const trackAnalysisAssetConfig = {
    maxFileSizeBytes: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: [
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/flac',
        'audio/m4a',
    ],
    allowedFileTypes: ['mp3', 'ogg', 'wav', 'flac', 'm4a'],
} as const;

export const midiTranscriptionAssetConfig = {
    maxFileSizeBytes: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: [
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/flac',
        'audio/m4a',
    ],
    allowedFileTypes: ['mp3', 'ogg', 'wav', 'flac', 'm4a'],
    maxNumFiles: 5,
} as const;

export const lyricsTranscriptionAssetConfig = {
    maxFileSizeBytes: 1024 * 1024 * 50, // 50 MB
    allowedMimeTypes: [
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/flac',
        'audio/m4a',
    ],
    allowedFileTypes: ['mp3', 'ogg', 'wav', 'flac', 'm4a'],
} as const;
