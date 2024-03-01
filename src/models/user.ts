import { db } from '@/infra';
import { oauthAccountTable, userTable } from '@/infra/schema';
import { eq } from 'drizzle-orm';
import 'server-only';

export type NewUser = Omit<
    typeof userTable.$inferInsert,
    'createdAt' | 'updatedAt'
>;

export const userModel = {
    async findOne(id: string) {
        return await db.query.userTable.findFirst({
            where: eq(userTable.id, id),
        });
    },

    async createOne(user: NewUser) {
        return await db
            .insert(userTable)
            .values({
                ...user,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
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
            await tx.insert(userTable).values({
                ...user,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
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
            .set({ ...user, updatedAt: new Date() })
            .where(eq(userTable.id, id))
            .returning()
            .then((users) => users[0]);
    },
};
