import { db } from '@/db';
import { oauthAccountTable, userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import 'server-only';

export type NewUser = typeof userTable.$inferInsert;

export const userModel = {
    async findOne(id: string) {
        return await db.query.userTable.findFirst({
            where: eq(userTable.id, id),
        });
    },

    async createOne(user: NewUser) {
        return await db
            .insert(userTable)
            .values(user)
            .returning()
            .then((users) => users[0]);
    },

    /**
     * Will lowercase the email address before searching.
     */
    async findOneByEmail(email: string) {
        return await db.query.userTable.findFirst({
            where: eq(userTable.email, email.toLowerCase()),
        });
    },

    async createOneWithOAuthAccount(
        user: NewUser,
        providerId: 'github' | 'google' | 'facebook',
        providerUserId: string,
    ) {
        await db.transaction(async (tx) => {
            await tx.insert(userTable).values(user);
            await tx.insert(oauthAccountTable).values({
                providerId,
                providerUserId,
                userId: user.id,
            });
        });
    },

    async updateOne(id: string, user: Partial<NewUser>) {
        return await db
            .update(userTable)
            .set(user)
            .where(eq(userTable.id, id))
            .returning()
            .then((users) => users[0]);
    },
};
