import {
    signUpSchemaServer,
    signUpSchemaServerType,
} from '@/src/app/_schemas/server/sign-up';
import { auth } from '@/src/app/_server/auth';
import { sendEmailVerificationLink } from '@/src/app/_server/email';
import { generateEmailVerificationToken } from '@/src/app/_server/token';
import * as context from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const POST = async (request: NextRequest) => {
    try {
        const data: signUpSchemaServerType = await request.json();
        const { email, password, confirmPassword } = data;

        await signUpSchemaServer.parseAsync({
            email,
            password,
            confirmPassword,
        });
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

        return new Response(null, {
            status: 302,
            headers: {
                Location: '/email-verification',
            },
        });
    } catch (e) {
        console.log(e);

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
                error: 'Server error, please try again later',
            },
            {
                status: 500,
            },
        );
    }
};
