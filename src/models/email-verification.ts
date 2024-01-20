import { db } from '@/db';
import { emailVerification as emailVerificationTable } from '@/db/schema';
import { AppError, errorNames } from '@/lib/error';
import { eq } from 'drizzle-orm';
import 'server-cli-only';

type NewEmailVerificationToken = typeof emailVerificationTable.$inferInsert;

class EmailVerificationModel {
    async findManyByUserId(userId: string) {
        return await db.query.emailVerification.findMany({
            where: eq(emailVerificationTable.userId, userId),
        });
    }

    async createOne(token: NewEmailVerificationToken) {
        return await db
            .insert(emailVerificationTable)
            .values(token)
            .returning()
            .then((tokens) => tokens[0]);
    }

    /**
     * @throws {AppError} if token is invalid or expired
     */
    async validateAndDeleteEmailVerificationToken(token: string) {
        return await db.transaction(async (tx) => {
            const [storedToken] = await tx
                .select()
                .from(emailVerificationTable)
                .where(eq(emailVerificationTable.id, token));
            if (!storedToken)
                throw new AppError(
                    errorNames.validationError,
                    'Invalid token',
                    true,
                );
            await tx
                .delete(emailVerificationTable)
                .where(eq(emailVerificationTable.userId, storedToken.userId));
            return storedToken;
        });
    }
}

export const emailVerificationModel = new EmailVerificationModel();
