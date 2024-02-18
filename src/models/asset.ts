import { db } from '@/db';
import { assetTable } from '@/db/schema';
import { generatePublicId } from '@/lib/utils';
import { eq } from 'drizzle-orm';
import 'server-only';

type NewAsset = Omit<
    typeof assetTable.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
>;

export const assetModel = {
    async findOne(id: string) {
        return await db.query.assetTable.findFirst({
            where: eq(assetTable.id, id),
        });
    },

    async updateOne(id: string, asset: Partial<NewAsset>) {
        return await db
            .update(assetTable)
            .set({ ...asset, updatedAt: new Date() })
            .where(eq(assetTable.id, id))
            .returning()
            .then((assets) => assets[0]);
    },

    async findManyByTrackId(trackId: string) {
        return await db.query.assetTable.findMany({
            where: eq(assetTable.trackId, trackId),
        });
    },

    async createOne(asset: NewAsset) {
        return await db
            .insert(assetTable)
            .values({
                ...asset,
                id: generatePublicId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning({ id: assetTable.id })
            .then((assets) => assets[0]);
    },
};
