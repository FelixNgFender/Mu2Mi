import { db } from '@/db';
import { assetTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import 'server-only';

type NewAsset = Omit<typeof assetTable.$inferInsert, 'createdAt' | 'updatedAt'>;

export const assetModel = {
    async findOne(id: string) {
        return await db.query.assetTable.findFirst({
            where: eq(assetTable.id, id),
        });
    },

    async createOne(asset: NewAsset) {
        return await db
            .insert(assetTable)
            .values({ ...asset, createdAt: new Date(), updatedAt: new Date() })
            .returning()
            .then((assets) => assets[0]);
    },
};
