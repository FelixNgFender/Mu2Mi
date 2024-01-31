import { db } from '@/db';
import { assetTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import 'server-only';

type NewAsset = typeof assetTable.$inferInsert;

export const assetModel = {
    async findOne(id: string) {
        return await db.query.assetTable.findFirst({
            where: eq(assetTable.id, id),
        });
    },

    async createOne(asset: NewAsset) {
        return await db
            .insert(assetTable)
            .values(asset)
            .returning()
            .then((assets) => assets[0]);
    },
};
