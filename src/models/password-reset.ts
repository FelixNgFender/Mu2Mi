import { db } from '@/db';
import { passwordResetTable } from '@/db/schema';
import { AppError } from '@/lib/error';
import { eq } from 'drizzle-orm';
import 'server-only';

type NewPasswordResetToken = typeof passwordResetTable.$inferInsert;

class PasswordResetModel {
    async findManyByUserId(userId: string) {
        return await db.query.passwordResetTable.findMany({
            where: eq(passwordResetTable.userId, userId),
        });
    }

    async createOne(token: NewPasswordResetToken) {
        return await db
            .insert(passwordResetTable)
            .values(token)
            .returning()
            .then((tokens) => tokens[0]);
    }

    async deleteAllByUserId(userId: string) {
        return await db
            .delete(passwordResetTable)
            .where(eq(passwordResetTable.userId, userId));
    }

    async validateAndDelete(token: string) {
        return await db.transaction(async (tx) => {
            const storedToken = await tx.query.passwordResetTable.findFirst({
                where: eq(passwordResetTable.id, token),
            });
            if (storedToken) {
                await tx
                    .delete(passwordResetTable)
                    .where(eq(passwordResetTable.id, storedToken.id));
            }
            return storedToken;
        });
    }
}

export const passwordResetModel = new PasswordResetModel();
