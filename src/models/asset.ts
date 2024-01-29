import { db } from '@/db';
import { asset as assetTable } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import 'server-cli-only';

type NewAsset = typeof assetTable.$inferInsert;

class AssetModel {
    async findByIdAndUserId(id: number, userId: string) {
        return await db.query.asset.findFirst({
            where: and(eq(assetTable.id, id), eq(assetTable.userId, userId)),
        });
    }

    async createOne(asset: NewAsset) {
        return await db
            .insert(assetTable)
            .values(asset)
            .returning()
            .then((assets) => assets[0]);
    }
}

export const assetModel = new AssetModel();
