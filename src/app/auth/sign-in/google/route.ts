import { env } from '@/config/env';
import { googleAuth } from '@/lib/auth';
import { HttpResponse } from '@/lib/response';
import { generateCodeVerifier, generateState } from 'arctic';
import { cookies } from 'next/headers';

export const GET = async () => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
        scopes: ['email'],
    });
    cookies().set('google_oauth_code_verifier', codeVerifier, {
        path: '/',
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: env.AUTH_COOKIE_DURATION_S,
        sameSite: 'lax',
    });
    cookies().set('google_oauth_state', state, {
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
