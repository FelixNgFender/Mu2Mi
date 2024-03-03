import { midiTranscriptionAssetConfig } from '@/config/asset';
import { z } from 'zod';

export const midiFormSchema = z.object({
    files: z
        .any()
        .refine((files: FileList | null) => {
            return (
                files &&
                Array.from(files).length <=
                    midiTranscriptionAssetConfig.maxNumFiles
            );
        }, `Max number of files is ${midiTranscriptionAssetConfig.maxNumFiles}.`)
        .refine(
            (files: FileList | null) => {
                return (
                    files &&
                    Array.from(files).every(
                        (file) =>
                            file.size <=
                            midiTranscriptionAssetConfig.maxFileSizeBytes,
                    )
                );
            },
            `Max file size is ${
                midiTranscriptionAssetConfig.maxFileSizeBytes / 1024 / 1024
            } MB.`,
        )
        .refine(
            (files: FileList | null) => {
                return (
                    files &&
                    Array.from(files).every((file) =>
                        midiTranscriptionAssetConfig.allowedMimeTypes.includes(
                            file.type as (typeof midiTranscriptionAssetConfig.allowedMimeTypes)[number],
                        ),
                    )
                );
            },
            `Only ${midiTranscriptionAssetConfig.allowedFileTypes
                .map((type) => type.toUpperCase())
                .join(', ')} files are allowed.`,
        ),
});

export type MidiFormType = z.infer<typeof midiFormSchema>;
