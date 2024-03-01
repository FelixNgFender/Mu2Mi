import { db } from '@/infra';
import { oauthAccountTable, userTable } from '@/infra/schema';
import { and, eq } from 'drizzle-orm';
import 'server-only';

export type NewOAuthAccount = typeof oauthAccountTable.$inferInsert;

export const oAuthAccountModel = {
    async createOne(oAuthAccount: NewOAuthAccount) {
        return await db
            .insert(oauthAccountTable)
            .values(oAuthAccount)
            .returning()
            .then((oAuthAccounts) => oAuthAccounts[0]);
    },

    async findOneByProviderIdAndProviderUserId(
        providerId: 'github' | 'google' | 'facebook',
        providerUserId: string,
    ) {
        return await db.query.oauthAccountTable.findFirst({
            where: and(
                eq(oauthAccountTable.providerId, providerId),
                eq(oauthAccountTable.providerUserId, providerUserId),
            ),
        });
    },
};
