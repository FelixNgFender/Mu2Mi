import { db } from '@/db';
import { trackTable } from '@/db/schema';
import 'server-only';

export type NewTrack = typeof trackTable.$inferInsert;

class TrackModel {
    async createOne(track: NewTrack) {
        return await db
            .insert(trackTable)
            .values(track)
            .returning()
            .then((tracks) => tracks[0]);
    }
}

export const trackModel = new TrackModel();
