import { env } from '@/config/env';
import { db } from '@/infra';
import { sessionTable, userTable } from '@/infra/schema';
import type { DatabaseUser } from '@/models/user';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { GitHub, Google } from 'arctic';
import { Lucia, TimeSpan } from 'lucia';
import 'server-only';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const auth = new Lucia(adapter, {
    sessionCookie: {
        // this sets cookies with super long expiration
        // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
        expires: false,
        attributes: {
            // set to `true` when using HTTPS
            secure: process.env.NODE_ENV === 'production',
        },
    },
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email,
            emailVerified: attributes.emailVerified,
        };
    },
    sessionExpiresIn: new TimeSpan(30, 'd'),
});

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

// export const facebookAuth = new Facebook(
//     env.FACEBOOK_CLIENT_ID,
//     env.FACEBOOK_CLIENT_SECRET,
//     env.FACEBOOK_REDIRECT_URI,
// );

export const githubAuth = new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
);
