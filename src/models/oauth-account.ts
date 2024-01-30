import { db } from '@/db';
import { oauthAccountTable, userTable } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import 'server-only';

export type NewOAuthAccount = typeof oauthAccountTable.$inferInsert;

class OAuthAccountModel {
    async createOne(oAuthAccount: NewOAuthAccount) {
        return await db
            .insert(oauthAccountTable)
            .values(oAuthAccount)
            .returning()
            .then((oAuthAccounts) => oAuthAccounts[0]);
    }

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
    }
}

export const oAuthAccountModel = new OAuthAccountModel();
