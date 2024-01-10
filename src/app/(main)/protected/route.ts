import { auth } from '@/src/app/_server/auth';
import * as context from 'next/headers';
import type { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    const authRequest = auth.handleRequest(request.method, context);
    // check if user is authenticated
    const session = await authRequest.validate();
    if (!session) {
        return new Response(null, {
            status: 401,
        });
    }

    if (!session.user.emailVerified) {
        return new Response(null, {
            status: 403,
        });
    }

    return new Response(JSON.stringify(session.user), {
        status: 200,
    });
};
