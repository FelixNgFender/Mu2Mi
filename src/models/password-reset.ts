import { db } from '@/db';
import { passwordReset as passwordResetTable } from '@/db/schema';
import { AppError, errorNames } from '@/lib/error';
import { eq } from 'drizzle-orm';
import 'server-cli-only';

type NewPasswordResetToken = typeof passwordResetTable.$inferInsert;

class PasswordResetModel {
    async findManyByUserId(userId: string) {
        return await db.query.passwordReset.findMany({
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

    /**
     * @throws {AppError} if token is invalid or expired
     */
    async validateAndDeletePasswordResetToken(token: string) {
        return await db.transaction(async (tx) => {
            const [storedToken] = await tx
                .select()
                .from(passwordResetTable)
                .where(eq(passwordResetTable.id, token));
            if (!storedToken)
                throw new AppError(
                    errorNames.validationError,
                    'Invalid token',
                    true,
                );
            await tx
                .delete(passwordResetTable)
                .where(eq(passwordResetTable.id, storedToken.id));
            return storedToken;
        });
    }
}

export const passwordResetModel = new PasswordResetModel();
