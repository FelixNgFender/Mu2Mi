import {
    newPasswordSchemaServer,
    newPasswordSchemaServerType,
} from '@/app/_schemas/server/new-password';
import { auth } from '@/app/_server/auth';
import { validatePasswordResetToken } from '@/app/_server/token';
import { type NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

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
        const data: newPasswordSchemaServerType = await request.json();
        const { password, confirmPassword } = data;

        await newPasswordSchemaServer.parseAsync({
            password,
            confirmPassword,
        });

        const { token } = params;
        const userId = await validatePasswordResetToken(token);
        let user = await auth.getUser(userId);
        console.log('user', user);
        await auth.invalidateAllUserSessions(user.userId);
        console.log('reach here');
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
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/',
                'Set-Cookie': sessionCookie.serialize(),
            },
        });
    } catch (e) {
        if (e instanceof ZodError) {
            return NextResponse.json(
                {
                    errors: e.errors,
                },
                {
                    status: 400,
                },
            );
        }
        return NextResponse.json(
            {
                error: 'Invalid or expired password reset link',
            },
            {
                status: 400,
            },
        );
    }
};
