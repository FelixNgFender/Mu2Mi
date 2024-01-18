import { googleAuth } from '@/lib/auth';
import { env } from '@/lib/env';
import { HttpResponse } from '@/lib/response';
import * as context from 'next/headers';
import type { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
    const [url, state] = await googleAuth.getAuthorizationUrl();
    context.cookies().set('google_oauth_state', state, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        path: '/',
        maxAge: env.AUTH_COOKIE_DURATION_S,
    });
    return HttpResponse.redirect(undefined, {
        Location: url.toString(),
    });
};
