import { auth } from '@/lib/auth';
import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { validatePasswordResetToken } from '@/lib/token';
import {
    newPasswordSchemaServer,
    NewPasswordSchemaServerType,
} from '@/validations/server/new-password';
import { type NextRequest } from 'next/server';

export const POST = async (
    request: NextRequest,
    {
        params,
    }: {
        params: {
            token: string;
        };
    },
) => {
    try {
        const data: NewPasswordSchemaServerType = await request.json();
        const { password, confirmPassword } = data;

        const result = await newPasswordSchemaServer.safeParseAsync({
            password,
            confirmPassword,
        });

        if (!result.success) {
            return HttpResponse.badRequest(JSON.stringify(result.error.issues));
        }
        const { token } = params;
        const userId = await validatePasswordResetToken(token);
        let user = await auth.getUser(userId);
        await auth.invalidateAllUserSessions(user.userId);
        await auth.updateKeyPassword('email', user.email, password);
        if (!user.emailVerified) {
            user = await auth.updateUserAttributes(user.userId, {
                email_verified: true,
            });
        }
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
        await errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};
