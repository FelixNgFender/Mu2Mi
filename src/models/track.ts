import { db } from '@/db';
import { trackTable } from '@/db/schema';
import 'server-only';

export type NewTrack = typeof trackTable.$inferInsert;

export const trackModel = {
    async createOne(track: NewTrack) {
        return await db
            .insert(trackTable)
            .values(track)
            .returning()
            .then((tracks) => tracks[0]);
    },
};
