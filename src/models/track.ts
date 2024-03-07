import { db } from '@/infra';
import { assetTable, trackTable } from '@/infra/schema';
import { desc, eq } from 'drizzle-orm';
import 'server-only';

type NewTrack = Omit<typeof trackTable.$inferInsert, 'createdAt' | 'updatedAt'>;

type UpdateTrack = Partial<Omit<typeof trackTable.$inferInsert, 'updatedAt'>>;

const createOne = async (track: NewTrack) => {
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
};

const createOneAndUpdateAsset = async (track: NewTrack, assetId: string) => {
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
            .where(eq(assetTable.id, assetId))
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
};

const findOne = async (id: string) => {
    return await db.query.trackTable.findFirst({
        where: eq(trackTable.id, id),
        columns: {
            userId: true,
            public: true,
            musicGenerationStatus: true,
            styleRemixStatus: true,
            trackSeparationStatus: true,
            trackAnalysisStatus: true,
            midiTranscriptionStatus: true,
            lyricsTranscriptionStatus: true,
        },
    });
};

const findManyByUserId = async (userId: string) => {
    return await db.query.trackTable.findMany({
        where: eq(trackTable.userId, userId),
        columns: {
            id: true,
            name: true,
            public: true,
            musicGenerationStatus: true,
            styleRemixStatus: true,
            trackSeparationStatus: true,
            trackAnalysisStatus: true,
            midiTranscriptionStatus: true,
            lyricsTranscriptionStatus: true,
        },
        orderBy: [desc(trackTable.createdAt)],
    });
};

type ReturnedTrack = Awaited<ReturnType<typeof findManyByUserId>>[number];

const updateOne = async (id: string, track: UpdateTrack) => {
    await db
        .update(trackTable)
        .set({ ...track, updatedAt: new Date() })
        .where(eq(trackTable.id, id));
};

const deleteOne = async (id: string) => {
    await db.delete(trackTable).where(eq(trackTable.id, id));
};

export type { ReturnedTrack };

export {
    createOne,
    createOneAndUpdateAsset,
    findOne,
    findManyByUserId,
    updateOne,
    deleteOne,
};
