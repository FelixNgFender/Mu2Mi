import { auth } from '@/lib/auth';
import { sendEmailVerificationLink } from '@/lib/email';
import { generateEmailVerificationToken } from '@/server/token';
import type { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    const authRequest = auth.handleRequest(request);
    const session = await authRequest.validate();
    if (!session) {
        return new Response(null, {
            status: 401,
        });
    }
    if (session.user.emailVerified) {
        return new Response(
            JSON.stringify({
                error: 'Email already verified',
            }),
            {
                status: 422,
            },
        );
    }
    try {
        const token = await generateEmailVerificationToken(session.user.userId);
        await sendEmailVerificationLink(session.user.email, token);
        return new Response();
    } catch {
        return new Response(
            JSON.stringify({
                error: 'Server error, please try again later',
            }),
            {
                status: 500,
            },
        );
    }
};
