import { auth } from '@/lib/auth';
import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { validateEmailVerificationToken } from '@/lib/token';
import type { NextRequest } from 'next/server';

export const GET = async (
    _: NextRequest,
    {
        params,
    }: {
        params: {
            token: string;
        };
    },
) => {
    const { token } = params;
    try {
        const userId = await validateEmailVerificationToken(token);
        const user = await auth.getUser(userId);
        await auth.invalidateAllUserSessions(user.userId);
        await auth.updateUserAttributes(user.userId, {
            email_verified: true, // `Number(true)` if stored as an integer
        });
        const session = await auth.createSession({
            userId: user.userId,
            attributes: {},
        });
        const sessionCookie = auth.createSessionCookie(session);
        return HttpResponse.redirect(undefined, {
            Location: '/',
            'Set-Cookie': sessionCookie.serialize(),
        });
    } catch (err) {
        errorHandler.handleError(err as Error);
        return HttpResponse.badRequest('Invalid email verification link');
    }
};
