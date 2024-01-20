import { auth } from '@/lib/auth';
import { sendEmailVerificationLink } from '@/lib/email';
import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { generateEmailVerificationToken } from '@/lib/token';
import {
    signUpSchemaServer,
    signUpSchemaServerType,
} from '@/validations/server/sign-up';
import * as context from 'next/headers';
import { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    try {
        const data: signUpSchemaServerType = await request.json();
        const { email, password, confirmPassword } = data;

        const result = await signUpSchemaServer.safeParseAsync({
            email,
            password,
            confirmPassword,
        });

        if (!result.success) {
            return HttpResponse.badRequest(JSON.stringify(result.error.issues));
        }

        const user = await auth.createUser({
            key: {
                providerId: 'email',
                providerUserId: email.toLowerCase(),
                password, // hashed by Lucia
            },
            attributes: {
                username: email.toLowerCase(),
                username_lower: email.toLowerCase(),
                email: email.toLowerCase(),
                email_verified: false,
            },
        });
        const session = await auth.createSession({
            userId: user.userId,
            attributes: {},
        });
        const authRequest = auth.handleRequest(request.method, context);
        authRequest.setSession(session);

        const token = await generateEmailVerificationToken(user.userId);
        await sendEmailVerificationLink(email, token);

        return HttpResponse.redirect(undefined, {
            Location: '/auth/email-verification',
        });
    } catch (err) {
        await errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};
