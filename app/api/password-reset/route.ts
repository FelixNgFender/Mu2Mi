import {
    passwordResetSchemaServer,
    passwordResetSchemaServerType,
} from '@/app/_schemas/server/password-reset';
import { auth } from '@/app/_server/auth';
import { db } from '@/app/_server/db';
import { sendPasswordResetLink } from '@/app/_server/email';
import { user as userTable } from '@/app/_server/schema';
import { generatePasswordResetToken } from '@/app/_server/token';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const POST = async (request: NextRequest) => {
    try {
        const data: passwordResetSchemaServerType = await request.json();
        const { email } = data;

        await passwordResetSchemaServer.parseAsync({
            email,
        });

        const [storedUser] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email.toLowerCase()));
        const user = auth.transformDatabaseUser({
            ...storedUser,
            username_lower: storedUser.usernameLower,
            email_verified: storedUser.emailVerified,
        });
        const token = await generatePasswordResetToken(user.userId);
        await sendPasswordResetLink(user.email, token);
        return new Response();
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