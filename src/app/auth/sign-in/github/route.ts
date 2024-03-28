import { env } from '@/config/env';
import { githubAuth } from '@/lib/auth';
import { withErrorHandling } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { generateState } from 'arctic';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
    const state = generateState();
    const url = await githubAuth.createAuthorizationURL(state, {
        scopes: ['user:email'],
    });
    cookies().set('github_oauth_state', state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: env.AUTH_COOKIE_DURATION_S,
        sameSite: 'lax',
    });
    return HttpResponse.redirect(undefined, {
        Location: url.toString(),
    });
});
