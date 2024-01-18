import { auth } from '@/lib/auth';
import { sendEmailVerificationLink } from '@/lib/email';
import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { generateEmailVerificationToken } from '@/lib/token';
import { type NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    const authRequest = auth.handleRequest(request);
    const session = await authRequest.validate();
    if (!session) {
        return HttpResponse.unauthorized();
    }
    if (session.user.emailVerified) {
        return HttpResponse.unprocessableEntity('Email already verified');
    }
    try {
        const token = await generateEmailVerificationToken(session.user.userId);
        await sendEmailVerificationLink(session.user.email, token);
        return HttpResponse.success();
    } catch (err) {
        errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};
