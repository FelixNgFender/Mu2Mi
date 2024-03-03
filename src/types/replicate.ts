import { musicGenerationFormSchema } from '@/app/studio/(features)/(generation)/new/schemas';
import { analysisFormSchema } from '@/app/studio/(features)/analysis/new/schemas';
import { lyricsFormSchema } from '@/app/studio/(features)/lyrics/new/schemas';
import { styleRemixFormSchema } from '@/app/studio/(features)/remix/new/schemas';
import { separationFormSchema } from '@/app/studio/(features)/separation/new/schemas';
import { z } from 'zod';

export const webhookMetadataSchema = z.object({
    taskId: z.string().min(15).max(15), // = track id
    userId: z.string().min(15).max(15),
});

export const musicGenerationInputSchema = musicGenerationFormSchema
    .omit({
        file: true,
    })
    .extend({
        input_audio: z.string().url().optional(),
    });

const musicGenerationSchema = musicGenerationInputSchema.merge(
    webhookMetadataSchema,
);

export type MusicGenerationSchemaType = z.infer<typeof musicGenerationSchema>;

export const styleRemixInputSchema = styleRemixFormSchema
    .omit({
        file: true,
    })
    .extend({
        music_input: z.string().url(),
    });

const styleRemixSchema = styleRemixInputSchema.merge(webhookMetadataSchema);

export type StyleRemixSchemaType = z.infer<typeof styleRemixSchema>;

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

export interface MusicGenerationWebhookBody extends ReplicateWebhookBody {
    output: string | null;
}

export interface StyleRemixWebhookBody extends ReplicateWebhookBody {
    output: (string | null) | Array<string | null>;
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
    | MusicGenerationWebhookBody
    | StyleRemixWebhookBody
    | TrackSeparationWebhookBody
    | TrackAnalysisWebhookBody
    | MidiTranscriptionWebhookBody
    | LyricsTranscriptionWebhookBody;
