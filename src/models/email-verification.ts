import { db } from '@/db';
import { emailVerificationTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import 'server-cli-only';

type NewEmailVerificationCode = typeof emailVerificationTable.$inferInsert;

class EmailVerificationModel {
    async createOne(token: NewEmailVerificationCode) {
        return await db
            .insert(emailVerificationTable)
            .values(token)
            .returning()
            .then((codes) => codes[0]);
    }

    async validateAndDelete(userId: string) {
        return await db.transaction(async (tx) => {
            const databaseCode =
                await tx.query.emailVerificationTable.findFirst({
                    where: eq(emailVerificationTable.userId, userId),
                });
            if (databaseCode) {
                await tx
                    .delete(emailVerificationTable)
                    .where(eq(emailVerificationTable.userId, userId));
                return databaseCode;
            }
        });
    }

    async deleteAllByUserId(userId: string) {
        return await db
            .delete(emailVerificationTable)
            .where(eq(emailVerificationTable.userId, userId));
    }
}

export const emailVerificationModel = new EmailVerificationModel();
