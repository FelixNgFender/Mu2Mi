import { db } from '@/db';
import { trackTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import 'server-only';

export type NewTrack = Omit<
    typeof trackTable.$inferInsert,
    'createdAt' | 'updatedAt'
>;

export const trackModel = {
    async findOne(id: string) {
        return await db.query.trackTable.findFirst({
            where: eq(trackTable.id, id),
        });
    },

    async updateOne(id: string, track: Partial<NewTrack>) {
        return await db
            .update(trackTable)
            .set({ ...track, updatedAt: new Date() })
            .where(eq(trackTable.id, id))
            .returning()
            .then((tracks) => tracks[0]);
    },

    async createOne(track: NewTrack) {
        return await db
            .insert(trackTable)
            .values({ ...track, createdAt: new Date(), updatedAt: new Date() })
            .returning()
            .then((tracks) => tracks[0]);
    },
};
