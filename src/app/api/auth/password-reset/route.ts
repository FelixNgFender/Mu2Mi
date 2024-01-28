import { auth } from '@/lib/auth';
import { sendPasswordResetLink } from '@/lib/email';
import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { generatePasswordResetToken } from '@/lib/token';
import { userModel } from '@/models/user';
import {
    passwordResetSchemaServer,
    PasswordResetSchemaServerType,
} from '@/validations/server/password-reset';
import { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    try {
        const data: PasswordResetSchemaServerType = await request.json();
        const { email } = data;

        const result = await passwordResetSchemaServer.safeParseAsync({
            email,
        });

        if (!result.success) {
            return HttpResponse.badRequest(JSON.stringify(result.error.issues));
        }

        const storedUser = await userModel.findOneByEmail(email);

        if (!storedUser) {
            return HttpResponse.badRequest();
        }

        const user = auth.transformDatabaseUser({
            ...storedUser,
            username_lower: storedUser.usernameLower,
            email_verified: storedUser.emailVerified,
        });
        const token = await generatePasswordResetToken(user.userId);
        await sendPasswordResetLink(user.email, token);
        return HttpResponse.success();
    } catch (err) {
        await errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};
