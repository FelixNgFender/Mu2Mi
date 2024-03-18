import { db } from '@/infra';
import { oauthAccountTable, userTable } from '@/infra/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import type { Session, User } from 'lucia';
import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';

type DatabaseUser = typeof userTable.$inferSelect;
type NewUser = Omit<typeof userTable.$inferInsert, 'createdAt' | 'updatedAt'>;

/**
 * Can be used in Server Components and Server Actions to get the current session and user.
 *
 * CSRF protection should be implemented but Next.js handles it when using
 * Server Actions (but not for Route Handlers).
 */
const getUserSession = cache(
    async (): Promise<
        { user: User; session: Session } | { user: null; session: null }
    > => {
        const sessionId = cookies().get(auth.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return {
                user: null,
                session: null,
            };
        }

        const result = await auth.validateSession(sessionId);
        // next.js throws when you attempt to set cookie when rendering page
        try {
            if (result.session && result.session.fresh) {
                const sessionCookie = auth.createSessionCookie(
                    result.session.id,
                );
                cookies().set(
                    sessionCookie.name,
                    sessionCookie.value,
                    sessionCookie.attributes,
                );
            }
            if (!result.session) {
                const sessionCookie = auth.createBlankSessionCookie();
                cookies().set(
                    sessionCookie.name,
                    sessionCookie.value,
                    sessionCookie.attributes,
                );
            }
        } catch {}
        return result;
    },
);

const createOne = async (user: NewUser) => {
    await db.insert(userTable).values({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};

const createOneWithOAuthAccount = async (
    user: NewUser,
    providerId: 'github' | 'google', // | 'facebook',
    providerUserId: string,
) => {
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
};

const findOne = async (id: string) => {
    return await db.query.userTable.findFirst({
        where: eq(userTable.id, id),
        columns: {
            id: true,
        },
    });
};

/**
 * Will lowercase the email address before searching.
 */
const findOneByEmail = async (email: string) => {
    return await db.query.userTable.findFirst({
        where: eq(userTable.email, email.toLowerCase()),
        columns: {
            id: true,
            email: true,
            emailVerified: true,
            hashedPassword: true,
        },
    });
};

const updateOne = async (id: string, user: Partial<NewUser>) => {
    await db
        .update(userTable)
        .set({ ...user, updatedAt: new Date() })
        .where(eq(userTable.id, id));
};

const deleteOne = async (id: string) => {
    await db.delete(userTable).where(eq(userTable.id, id));
};

export type { DatabaseUser };

export {
    getUserSession,
    createOne,
    createOneWithOAuthAccount,
    findOne,
    findOneByEmail,
    updateOne,
    deleteOne,
};
