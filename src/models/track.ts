import { db } from '@/db';
import { assetTable, trackTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import 'server-only';

export type Track = typeof trackTable.$inferSelect;

export type NewTrack = Omit<
    typeof trackTable.$inferInsert,
    'createdAt' | 'updatedAt'
>;

export type UpdateTrack = Partial<
    Omit<typeof trackTable.$inferInsert, 'updatedAt'>
>;

export const trackModel = {
    // TODO: Select queries should be paginated and should not overfetch
    async findOne(id: string) {
        return await db.query.trackTable.findFirst({
            where: eq(trackTable.id, id),
        });
    },

    async findManyByUserId(userId: string) {
        return await db.query.trackTable.findMany({
            where: eq(trackTable.userId, userId),
        });
    },

    async deleteOne(id: string) {
        return await db.delete(trackTable).where(eq(trackTable.id, id));
    },

    async updateOne(id: string, track: UpdateTrack) {
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
            .values({
                ...track,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning({
                id: trackTable.id,
            })
            .then((tracks) => tracks[0]);
    },

    async createOneAndUpdateAsset(track: NewTrack, assetId: string) {
        return await db.transaction(async (tx) => {
            const newTrack = await tx
                .insert(trackTable)
                .values({
                    ...track,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning({
                    id: trackTable.id,
                })
                .then((tracks) => tracks[0]);

            if (!newTrack) {
                return;
            }

            const newAsset = await tx
                .update(assetTable)
                .set({ trackId: newTrack.id })
                .where(eq(trackTable.id, assetId))
                .returning({ name: assetTable.name })
                .then((assets) => assets[0]);

            if (!newAsset) {
                return;
            }

            return {
                trackId: newTrack.id,
                assetName: newAsset.name,
            };
        });
    },
};
