import { db } from '@/infra';
import { assetTable } from '@/infra/schema';
import { eq } from 'drizzle-orm';
import 'server-only';

type NewAsset = Omit<typeof assetTable.$inferInsert, 'createdAt' | 'updatedAt'>;

const createOne = async (asset: NewAsset) => {
    return await db
        .insert(assetTable)
        .values({
            ...asset,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning({ id: assetTable.id })
        .then((assets) => assets[0]);
};

const findManyByTrackId = async (trackId: string) => {
    return await db.query.assetTable.findMany({
        where: eq(assetTable.trackId, trackId),
        columns: {
            id: true,
            name: true,
            type: true,
            userId: true,
        },
    });
};

const findManyByUserId = async (userId: string) => {
    return await db.query.assetTable.findMany({
        where: eq(assetTable.userId, userId),
        columns: {
            name: true,
        },
    });
};

export { createOne, findManyByTrackId, findManyByUserId };
