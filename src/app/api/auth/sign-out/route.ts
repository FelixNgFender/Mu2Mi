import { auth } from '@/lib/auth';
import { HttpResponse } from '@/lib/response';
import * as context from 'next/headers';
import type { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    const authRequest = auth.handleRequest(request.method, context);
    // check if user is authenticated
    const session = await authRequest.validate();
    if (!session) {
        return HttpResponse.unauthorized();
    }
    // make sure to invalidate the current session!
    await auth.invalidateSession(session.sessionId);
    // delete session cookie
    authRequest.setSession(null);
    return HttpResponse.redirect(undefined, {
        Location: '/auth/sign-in',
    });
};
