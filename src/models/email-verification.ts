import { db, schema } from '@/infra';
import { eq } from 'drizzle-orm';
import 'server-only';

const { emailVerificationTable } = schema;

type NewEmailVerificationCode = typeof emailVerificationTable.$inferInsert;

const createOne = async (token: NewEmailVerificationCode) => {
    await db.insert(emailVerificationTable).values(token);
};

const validateAndDelete = async (userId: string) => {
    return await db.transaction(async (tx) => {
        const databaseCode = await tx.query.emailVerificationTable.findFirst({
            where: eq(emailVerificationTable.userId, userId),
            columns: {
                code: true,
                expiresAt: true,
                email: true,
            },
        });
        if (databaseCode) {
            await tx
                .delete(emailVerificationTable)
                .where(eq(emailVerificationTable.userId, userId));
            return databaseCode;
        }
    });
};

const deleteAllByUserId = async (userId: string) => {
    await db
        .delete(emailVerificationTable)
        .where(eq(emailVerificationTable.userId, userId));
};

export { createOne, validateAndDelete, deleteAllByUserId };
