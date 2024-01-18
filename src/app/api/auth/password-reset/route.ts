import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { sendPasswordResetLink } from '@/lib/email';
import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { generatePasswordResetToken } from '@/lib/token';
import {
    passwordResetSchemaServer,
    passwordResetSchemaServerType,
} from '@/lib/validations/server/password-reset';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    try {
        const data: passwordResetSchemaServerType = await request.json();
        const { email } = data;

        const result = await passwordResetSchemaServer.safeParseAsync({
            email,
        });

        if (!result.success) {
            return HttpResponse.badRequest(result.error.format());
        }

        const [storedUser] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email.toLowerCase()));
        // already checked email exists in the schema parse above, so safe to assert here
        const user = auth.transformDatabaseUser({
            ...storedUser!,
            username_lower: storedUser!.usernameLower,
            email_verified: storedUser!.emailVerified,
        });
        const token = await generatePasswordResetToken(user.userId);
        await sendPasswordResetLink(user.email, token);
        return HttpResponse.success();
    } catch (err) {
        errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};
