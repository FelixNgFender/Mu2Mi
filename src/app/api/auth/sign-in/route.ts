import { auth } from '@/lib/auth';
import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import {
    signInSchemaServer,
    signInSchemaServerType,
} from '@/lib/validations/server/sign-in';
import * as context from 'next/headers';
import { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    try {
        const data: signInSchemaServerType = await request.json();
        const { email, password, rememberMe } = data;
        // const storedDeviceCookieId = context.cookies().get('device_cookie')
        //     ?.value;
        // const validDeviceCookie = isValidateDeviceCookie(
        //     storedDeviceCookieId,
        //     email,
        // );

        // if (!validDeviceCookie) {
        //     context.cookies().set('device_cookie', '', {
        //         path: '/',
        //         secure: env.NODE_ENV === 'production',
        //         maxAge: 0,
        //         httpOnly: true,
        //     });
        //     const storedTimeout = loginTimeout.get(email) ?? null;
        //     const timeoutUntil = storedTimeout?.timeoutUntil ?? 0;
        //     if (Date.now() < timeoutUntil) {
        //         throw new HttpError(
        //             errorNames.Http.ClientError.TooManyRequests,
        //             httpStatus.ClientError.TooManyRequests,
        //             `You've made too many login attempts. Please try again in ${Math.floor(
        //                 (timeoutUntil - Date.now()) / 1000,
        //             )} seconds.`,
        //             true,
        //         );
        //     }
        //     const timeoutSeconds = storedTimeout
        //         ? storedTimeout.timeoutSeconds * 2
        //         : env.TIMEOUT_DURATION_S;
        //     loginTimeout.set(email, {
        //         timeoutUntil: Date.now() + timeoutSeconds * 1000,
        //         timeoutSeconds,
        //     });
        //     try {
        //         await auth.useKey('email', email.toLowerCase(), password); // throws `LuciaError` if invalid
        //     } catch {
        //         throw new HttpError(
        //             errorNames.Http.ClientError.BadRequest,
        //             httpStatus.ClientError.BadRequest,
        //             `The email or password you entered is incorrect. You can try again in ${timeoutSeconds} seconds.`,
        //             true,
        //         );
        //     }
        //     loginTimeout.delete(email);
        // }

        // const newDeviceCookieId = generateRandomString(40);
        // deviceCookie.set(newDeviceCookieId, {
        //     email,
        //     attempts: 0,
        // });
        // context.cookies().set('device_cookie', newDeviceCookieId, {
        //     path: '/',
        //     secure: env.NODE_ENV === 'production',
        //     maxAge: env.DEVICE_COOKIE_DURATION_S * 1000,
        //     httpOnly: true,
        // });

        const result = await signInSchemaServer.safeParseAsync({
            email,
            password,
            rememberMe,
        });

        if (!result.success) {
            return HttpResponse.badRequest(result.error.format());
        }

        const key = await auth.useKey('email', email.toLowerCase(), password);
        const session = await auth.createSession({
            userId: key.userId,
            attributes: {},
        });
        const authRequest = auth.handleRequest(request.method, context);
        authRequest.setSession(session);
        return HttpResponse.redirect(undefined, {
            Location: '/',
        });
    } catch (err) {
        await errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};

// export const loginTimeout = new Map<
//     string,
//     {
//         timeoutUntil: number;
//         timeoutSeconds: number;
//     }
// >();

// export const deviceCookie = new Map<
//     string,
//     {
//         email: string;
//         attempts: number;
//     }
// >();

// export const isValidateDeviceCookie = (
//     deviceCookieId: string | undefined,
//     email: string,
// ) => {
//     if (!deviceCookieId) return false;
//     const deviceCookieAttributes = deviceCookie.get(deviceCookieId) ?? null;
//     if (!deviceCookieAttributes) return false;
//     const currentAttempts = deviceCookieAttributes.attempts + 1;
//     if (currentAttempts > 5 || deviceCookieAttributes.email !== email) {
//         deviceCookie.delete(deviceCookieId);
//         return false;
//     }
//     deviceCookie.set(deviceCookieId, {
//         email: email,
//         attempts: currentAttempts,
//     });
//     return true;
// };

// export class TooManyRequestsError extends Error {
//     constructor(message: string) {
//         super(message);
//         this.name = 'TooManyRequestsError';
//     }
// }
