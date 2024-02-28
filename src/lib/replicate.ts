import { env } from '@/config/env';
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
        const webhook = new URL(`${env.ORIGIN}/api/webhook/generation`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        return this.replicate.predictions.create({
            version: env.MUSIC_GENERATION_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            webhook_events_filter: ['completed'],
        });
    }

    async styleRemix({ taskId, userId, ...data }: StyleRemixSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/remix`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        return this.replicate.predictions.create({
            version: env.STYLE_REMIX_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            webhook_events_filter: ['completed'],
        });
    }

    async separateTrack({
        taskId,
        userId,
        ...data
    }: TrackSeparationSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/separation`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        return this.replicate.predictions.create({
            version: env.TRACK_SEPARATION_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            webhook_events_filter: ['completed'],
        });
    }

    async analyzeTrack({ taskId, userId, ...data }: TrackAnalysisSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/analysis`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        return this.replicate.predictions.create({
            version: env.TRACK_ANALYSIS_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            webhook_events_filter: ['completed'],
        });
    }

    async midiTranscription({
        taskId,
        userId,
        ...data
    }: MidiTranscriptionSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/midi`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        return this.replicate.predictions.create({
            version: env.MIDI_TRANSCRIPTION_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            webhook_events_filter: ['completed'],
        });
    }

    async lyricsTranscription({
        taskId,
        userId,
        ...data
    }: LyricsTranscriptionSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/lyrics`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        return this.replicate.predictions.create({
            version: env.LYRICS_TRANSCRIPTION_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            webhook_events_filter: ['completed'],
        });
    }
}

export const replicateClient = new ReplicateClient({
    auth: env.REPLICATE_API_TOKEN,
});
