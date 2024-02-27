import { generationFormSchema } from '@/app/studio/(generation)/new/schemas';
import { analysisFormSchema } from '@/app/studio/analysis/new/schemas';
import { lyricsFormSchema } from '@/app/studio/lyrics/new/schemas';
import { separationFormSchema } from '@/app/studio/separation/new/schemas';
import { z } from 'zod';

export const webhookMetadataSchema = z.object({
    taskId: z.string().min(15).max(15), // = track id
    userId: z.string().min(15).max(15),
});

export const musicgenInputSchema = generationFormSchema
    .omit({
        file: true,
    })
    .extend({
        input_audio: z.string().url().optional(),
    });

const musicgenSchema = musicgenInputSchema.merge(webhookMetadataSchema);

export type MusicgenSchemaType = z.infer<typeof musicgenSchema>;

export const trackSeparationInputSchema = separationFormSchema
    .omit({
        file: true,
    })
    .extend({
        audio: z.string().url(),
    });

const trackSeparationSchema = trackSeparationInputSchema.merge(
    webhookMetadataSchema,
);

export type TrackSeparationSchemaType = z.infer<typeof trackSeparationSchema>;

export const trackAnalysisInputSchema = analysisFormSchema
    .omit({
        file: true,
    })
    .extend({
        music_input: z.string().url(),
    });

const trackAnalysisSchema = trackAnalysisInputSchema.merge(
    webhookMetadataSchema,
);

export type TrackAnalysisSchemaType = z.infer<typeof trackAnalysisSchema>;

export const midiTranscriptionInputSchema = z.object({
    audio_file: z.string().url(),
});

const midiTranscriptionSchema = midiTranscriptionInputSchema.merge(
    webhookMetadataSchema,
);

export type MidiTranscriptionSchemaType = z.infer<
    typeof midiTranscriptionSchema
>;

export const lyricsTranscriptionInputSchema = lyricsFormSchema
    .omit({
        file: true,
    })
    .extend({
        audio: z.string().url(),
    });

const lyricsTranscriptionSchema = lyricsTranscriptionInputSchema.merge(
    webhookMetadataSchema,
);

export type LyricsTranscriptionSchemaType = z.infer<
    typeof lyricsTranscriptionSchema
>;

interface ReplicateWebhookBody {
    status: 'starting' | 'succeeded' | 'failed' | 'canceled';
    error: string | null;
    output: any;
}

export interface MusicGenWebhookBody extends ReplicateWebhookBody {
    output: string | null;
}

export interface TrackSeparationWebhookBody extends ReplicateWebhookBody {
    output: {
        bass: string | null;
        drums: string | null;
        other: string | null;
        piano: string | null;
        guitar: string | null;
        vocals: string | null;
    };
}

export interface TrackAnalysisWebhookBody extends ReplicateWebhookBody {
    output: [string | null, string | null, string | null];
}

export interface MidiTranscriptionWebhookBody extends ReplicateWebhookBody {
    output: string | null;
}

export interface LyricsTranscriptionWebhookBody extends ReplicateWebhookBody {
    output: {
        text: string | null;
        chunks: Array<{
            text: string;
            timestamp: Array<number>;
        }>;
    };
}

export type ReplicateWebhookBodyTypes =
    | MusicGenWebhookBody
    | TrackSeparationWebhookBody
    | TrackAnalysisWebhookBody
    | MidiTranscriptionWebhookBody
    | LyricsTranscriptionWebhookBody;
