import { db } from '@/infra';
import { passwordResetTable } from '@/infra/schema';
import { eq } from 'drizzle-orm';
import 'server-only';

type NewPasswordResetToken = typeof passwordResetTable.$inferInsert;

const createOne = async (token: NewPasswordResetToken) => {
    await db.insert(passwordResetTable).values(token);
};

const validateAndDelete = async (token: string) => {
    return await db.transaction(async (tx) => {
        const storedToken = await tx.query.passwordResetTable.findFirst({
            where: eq(passwordResetTable.id, token),
            columns: {
                id: true,
                userId: true,
                expiresAt: true,
            },
        });
        if (storedToken) {
            await tx
                .delete(passwordResetTable)
                .where(eq(passwordResetTable.id, storedToken.id));
        }
        return storedToken;
    });
};

const deleteAllByUserId = async (userId: string) => {
    await db
        .delete(passwordResetTable)
        .where(eq(passwordResetTable.userId, userId));
};

export { createOne, validateAndDelete, deleteAllByUserId };
