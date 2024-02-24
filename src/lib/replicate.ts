import { env } from '@/config/env';
import {
    LyricsTranscriptionSchemaType,
    MidiTranscriptionSchemaType,
    MusicgenSchemaType,
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

    async musicgen({ taskId, userId, ...data }: MusicgenSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/musicgen`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        return this.replicate.predictions.create({
            version: env.MUSICGEN_MODEL_VERSION,
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
            // start: immmediately on prediction start
            // completed: when the prediction reaches a terminal state (succeeded/canceled/failed)
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
