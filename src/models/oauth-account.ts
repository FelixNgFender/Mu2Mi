import { db, schema } from '@/infra';
import { and, eq } from 'drizzle-orm';
import 'server-only';

const { oauthAccountTable } = schema;

type NewOAuthAccount = typeof oauthAccountTable.$inferInsert;

const createOne = async (oAuthAccount: NewOAuthAccount) => {
    return await db
        .insert(oauthAccountTable)
        .values(oAuthAccount)
        .returning()
        .then((oAuthAccounts) => oAuthAccounts[0]);
};

const findOneByProvider = async (
    providerId: 'github' | 'google' | 'facebook',
    providerUserId: string,
) => {
    return await db.query.oauthAccountTable.findFirst({
        where: and(
            eq(oauthAccountTable.providerId, providerId),
            eq(oauthAccountTable.providerUserId, providerUserId),
        ),
        columns: {
            userId: true,
        },
    });
};

export { createOne, findOneByProvider };
