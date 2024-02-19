import { env } from '@/config/env';
import {
    MidiTranscriptionSchemaType,
    MusicgenSchemaType,
    RiffusionSchemaType,
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

    async riffusion({ taskId, userId, ...data }: RiffusionSchemaType) {
        const webhook = new URL(`${env.ORIGIN}/api/webhook/riffusion`);
        webhook.searchParams.set('taskId', taskId);
        webhook.searchParams.set('userId', userId);
        return this.replicate.predictions.create({
            version: env.RIFFUSION_MODEL_VERSION,
            input: data,
            webhook: webhook.toString(),
            webhook_events_filter: ['completed'],
        });
    }
}

export const replicateClient = new ReplicateClient({
    auth: env.REPLICATE_API_TOKEN,
});
