import { queryClient, redisClient } from '@/db';
import { env } from '@/server/env';
import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import { redis as redisAdapter } from '@lucia-auth/adapter-session-redis';
import { facebook, github, google, twitter } from '@lucia-auth/oauth/providers';
import { lucia } from 'lucia';
import { nextjs_future } from 'lucia/middleware';
import 'lucia/polyfill/node';
import * as context from 'next/headers';
import { cache } from 'react';
import 'server-cli-only';

export const auth = lucia({
    env: env.NODE_ENV === 'development' ? 'DEV' : 'PROD',
    middleware: nextjs_future(),
    adapter: {
        user: postgresAdapter(queryClient, {
            user: 'auth_user',
            key: 'user_key',
            session: null, // will be stored in Redis
        }),
        session: redisAdapter(redisClient),
    },
    sessionCookie: {
        expires: false,
    },
    getUserAttributes: (databaseUser) => {
        return {
            username: databaseUser.username,
            usernameLower: databaseUser.username_lower,
            email: databaseUser.email,
            emailVerified: databaseUser.email_verified,
        };
    },
});

export const googleAuth = google(auth, {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
    scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
    ],
});

// TODO: Implement routes
// TODO: Get new client ID and secret
// export const facebookAuth = facebook(auth, {
//     clientId: env.FACEBOOK_CLIENT_ID,
//     clientSecret: env.FACEBOOK_CLIENT_SECRET,
//     redirectUri: env.FACEBOOK_REDIRECT_URI,
//     scope: ['email', 'public_profile'],
// });

// TODO: Implement routes
// export const githubAuth = github(auth, {
// 	clientId: env.GITHUB_CLIENT_ID,
// 	clientSecret: env.GITHUB_CLIENT_SECRET
// });

// TODO: Implement routes
// export const twitterAuth = twitter(auth, {
//     clientId: env.TWITTER_CLIENT_ID,
//     clientSecret: env.TWITTER_CLIENT_SECRET,
//     redirectUri: env.TWITTER_REDIRECT_URI,
//     scope: ['email', 'public_profile'],
// });

export type Auth = typeof auth;

/**
 * For getting the current user in `page.tsx` and `layout.tsx`,
 * we recommend wrapping `AuthRequest.validate()` in `cache()`,
 * which is provided by React. This should not be used inside
 * `route.tsx` as Lucia will assume the request is a GET request.
 *
 * This allows you share the session across pages and layouts,
 * making it possible to validate the request in multiple layouts
 * and page files without making unnecessary database calls.
 * @example
 * ```tsx
 * const Page = async () => {
 *     const session = await getPageSession();
 * };
 * ```
 */
export const getPageSession = cache(() => {
    const authRequest = auth.handleRequest('GET', context);
    return authRequest.validate();
});
