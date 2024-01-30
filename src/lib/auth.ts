import { env } from '@/config/env';
import { db } from '@/db';
import { sessionTable, userTable } from '@/db/schema';
import type { DatabaseUser } from '@/db/schema';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Facebook, GitHub, Google } from 'arctic';
import { Lucia, TimeSpan } from 'lucia';
import type { Session, User } from 'lucia';
import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const auth = new Lucia(adapter, {
    sessionCookie: {
        // this sets cookies with super long expiration
        // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
        expires: false,
        attributes: {
            // set to `true` when using HTTPS
            secure: env.NODE_ENV === 'production',
        },
    },
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username,
            email: attributes.email,
            emailVerified: attributes.emailVerified,
        };
    },
    sessionExpiresIn: new TimeSpan(30, 'd'),
});

/**
 * Can be used in Server Components and Server Actions to get the current session and user.
 *
 * CSRF protection should be implemented but Next.js handles it when using
 * Server Actions (but not for Route Handlers).
 */
export const getUserSession = cache(
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

declare module 'lucia' {
    interface Register {
        Lucia: typeof auth;
        DatabaseUserAttributes: Omit<DatabaseUser, 'id'>;
    }
}

export const googleAuth = new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
);

export const facebookAuth = new Facebook(
    env.FACEBOOK_CLIENT_ID,
    env.FACEBOOK_CLIENT_SECRET,
    env.FACEBOOK_REDIRECT_URI,
);

export const githubAuth = new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
);
