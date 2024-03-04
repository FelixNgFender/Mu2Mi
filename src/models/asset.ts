import { db } from '@/infra';
import { schema } from '@/infra';
import { eq } from 'drizzle-orm';
import 'server-only';

const { assetTable } = schema;

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

export { createOne, findManyByTrackId };
