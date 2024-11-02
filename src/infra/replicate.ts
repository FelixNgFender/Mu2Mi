import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { AppError } from '@/lib/error';
import {
    LyricsTranscriptionSchemaType,
    MidiTranscriptionSchemaType,
    MusicGenerationSchemaType,
    StyleRemixSchemaType,
    TrackAnalysisSchemaType,
    TrackSeparationSchemaType,
} from '@/types/replicate';
import Replicate from 'replicate';
import 'server-only';

class ReplicateClient {
    replicate: Replicate;

    constructor({ auth }: { auth: string }) {
        this.replicate = new Replicate({ auth });

        // 🫠 - https://github.com/replicate/replicate-javascript/issues/136
        // Alternatively, opt out of caching in your component with noStore
        // https://github.com/replicate/replicate-javascript/issues/136#issuecomment-1847442879
        this.replicate.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
            fetch(input, { ...init, cache: 'no-store' });
    }

    async generateMusic({
        taskId,
        userId,
        ...data
    }: MusicGenerationSchemaType) {
        try {
            const webhook = new URL(
                `${env.ORIGIN}${siteConfig.paths.api.webhook.generation}`,
            );
            webhook.searchParams.set('taskId', taskId);
            webhook.searchParams.set('userId', userId);
            return this.replicate.predictions.create({
                version: env.MUSIC_GENERATION_MODEL_VERSION,
                input: data,
                webhook: webhook.toString(),
                webhook_events_filter: ['completed'],
            });
        } catch (error) {
            throw new AppError(
                'ReplicateError',
                (error as Error).message,
                true,
            );
        }
    }

    // async styleRemix({ taskId, userId, ...data }: StyleRemixSchemaType) {
    //     try {
    //         const webhook = new URL(
    //             `${env.ORIGIN}${siteConfig.paths.api.webhook.remix}`,
    //         );
    //         webhook.searchParams.set('taskId', taskId);
    //         webhook.searchParams.set('userId', userId);
    //         return this.replicate.predictions.create({
    //             version: env.STYLE_REMIX_MODEL_VERSION,
    //             input: data,
    //             webhook: webhook.toString(),
    //             webhook_events_filter: ['completed'],
    //         });
    //     } catch (error) {
    //         throw new AppError(
    //             'ReplicateError',
    //             (error as Error).message,
    //             true,
    //         );
    //     }
    // }

    async separateTrack({
        taskId,
        userId,
        ...data
    }: TrackSeparationSchemaType) {
        try {
            const webhook = new URL(
                `${env.ORIGIN}${siteConfig.paths.api.webhook.separation}`,
            );
            webhook.searchParams.set('taskId', taskId);
            webhook.searchParams.set('userId', userId);
            return this.replicate.predictions.create({
                version: env.TRACK_SEPARATION_MODEL_VERSION,
                input: data,
                webhook: webhook.toString(),
                webhook_events_filter: ['completed'],
            });
        } catch (error) {
            throw new AppError(
                'ReplicateError',
                (error as Error).message,
                true,
            );
        }
    }

    async analyzeTrack({ taskId, userId, ...data }: TrackAnalysisSchemaType) {
        try {
            const webhook = new URL(
                `${env.ORIGIN}${siteConfig.paths.api.webhook.analysis}`,
            );
            webhook.searchParams.set('taskId', taskId);
            webhook.searchParams.set('userId', userId);
            return this.replicate.predictions.create({
                version: env.TRACK_ANALYSIS_MODEL_VERSION,
                input: data,
                webhook: webhook.toString(),
                webhook_events_filter: ['completed'],
            });
        } catch (error) {
            throw new AppError(
                'ReplicateError',
                (error as Error).message,
                true,
            );
        }
    }

    async midiTranscription({
        taskId,
        userId,
        ...data
    }: MidiTranscriptionSchemaType) {
        try {
            const webhook = new URL(
                `${env.ORIGIN}${siteConfig.paths.api.webhook.midi}`,
            );
            webhook.searchParams.set('taskId', taskId);
            webhook.searchParams.set('userId', userId);
            return this.replicate.predictions.create({
                version: env.MIDI_TRANSCRIPTION_MODEL_VERSION,
                input: data,
                webhook: webhook.toString(),
                webhook_events_filter: ['completed'],
            });
        } catch (error) {
            throw new AppError(
                'ReplicateError',
                (error as Error).message,
                true,
            );
        }
    }

    async lyricsTranscription({
        taskId,
        userId,
        ...data
    }: LyricsTranscriptionSchemaType) {
        try {
            const webhook = new URL(
                `${env.ORIGIN}${siteConfig.paths.api.webhook.lyrics}`,
            );
            webhook.searchParams.set('taskId', taskId);
            webhook.searchParams.set('userId', userId);
            return this.replicate.predictions.create({
                version: env.LYRICS_TRANSCRIPTION_MODEL_VERSION,
                input: data,
                webhook: webhook.toString(),
                webhook_events_filter: ['completed'],
            });
        } catch (error) {
            throw new AppError(
                'ReplicateError',
                (error as Error).message,
                true,
            );
        }
    }
}

const replicate = new ReplicateClient({
    auth: env.REPLICATE_API_TOKEN,
});

export { replicate };
