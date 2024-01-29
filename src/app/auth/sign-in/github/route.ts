import { env } from '@/config/env';
import { githubAuth } from '@/lib/auth';
import { HttpResponse } from '@/lib/response';
import { generateState } from 'arctic';
import { cookies } from 'next/headers';

export const GET = async () => {
    const state = generateState();
    const url = await githubAuth.createAuthorizationURL(state);
    cookies().set('github_oauth_state', state, {
        path: '/',
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: env.AUTH_COOKIE_DURATION_S,
        sameSite: 'lax',
    });
    return HttpResponse.redirect(undefined, {
        Location: url.toString(),
    });
};
