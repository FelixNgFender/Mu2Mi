import {
    signInSchemaServer,
    signInSchemaServerType,
} from '@/app/_schemas/server/sign-in';
import { auth } from '@/app/_server/auth';
import * as context from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const POST = async (request: NextRequest) => {
    try {
        const data: signInSchemaServerType = await request.json();
        const { email, password, rememberMe } = data;

        await signInSchemaServer.parseAsync({
            email,
            password,
            rememberMe,
        });

        const key = await auth.useKey('email', email.toLowerCase(), password);
        const session = await auth.createSession({
            userId: key.userId,
            attributes: {},
        });
        const authRequest = auth.handleRequest(request.method, context);
        authRequest.setSession(session);
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/',
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
                error: 'Server error, please try again later',
            },
            {
                status: 500,
            },
        );
    }
};
