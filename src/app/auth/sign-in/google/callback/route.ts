import { auth, googleAuth } from '@/lib/auth';
import { AppError, errorHandler, errorNames } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { userModel } from '@/models/user';
import { OAuthRequestError } from '@lucia-auth/oauth';
import { cookies, headers } from 'next/headers';
import type { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
    const storedState = cookies().get('google_oauth_state')?.value;
    const url = new URL(request.url);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    if (!storedState || !state || storedState !== state || !code) {
        return HttpResponse.badRequest();
    }
    try {
        const { getExistingUser, googleUser, createUser, createKey } =
            await googleAuth.validateCallback(code);
        const getUser = async () => {
            const existingUser = await getExistingUser();
            if (existingUser) return existingUser;
            if (!googleUser.email_verified) {
                throw new AppError(
                    errorNames.validationError,
                    'Email not verified',
                    true,
                );
            }
            if (!googleUser.email) {
                throw new AppError(
                    errorNames.validationError,
                    'Email not provided',
                    true,
                );
            }
            const existingDatabaseUserWithEmail = await userModel.findOneByEmail(
                googleUser.email,
            );
            if (existingDatabaseUserWithEmail) {
                // transform `UserSchema` to `User`
                const user = auth.transformDatabaseUser({
                    ...existingDatabaseUserWithEmail,
                    username_lower: existingDatabaseUserWithEmail.usernameLower,
                    email_verified: existingDatabaseUserWithEmail.emailVerified,
                    // put more snake_case to camelCase transformations here
                });
                await createKey(user.userId);
                return user;
            }
            return await createUser({
                attributes: {
                    username: googleUser.name,
                    username_lower: googleUser.name.toLowerCase(),
                    email: googleUser.email,
                    email_verified: googleUser.email_verified,
                },
            });
        };

        const user = await getUser();
        const session = await auth.createSession({
            userId: user.userId,
            attributes: {},
        });
        const authRequest = auth.handleRequest(request.method, {
            cookies,
            headers,
        });
        authRequest.setSession(session);
        return HttpResponse.redirect(undefined, {
            Location: '/',
        });
    } catch (err) {
        if (err instanceof AppError) {
            return HttpResponse.unprocessableEntity(err.message);
        }
        if (err instanceof OAuthRequestError) {
            return HttpResponse.badRequest();
        }
        await errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};
