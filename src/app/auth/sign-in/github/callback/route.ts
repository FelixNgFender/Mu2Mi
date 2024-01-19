import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { auth, githubAuth } from '@/lib/auth';
import { AppError, errorHandler, errorNames } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { OAuthRequestError } from '@lucia-auth/oauth';
import { eq } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import type { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
    const storedState = cookies().get('github_oauth_state')?.value;
    const url = new URL(request.url);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    if (!storedState || !state || storedState !== state || !code) {
        return HttpResponse.badRequest();
    }
    try {
        const { getExistingUser, githubUser, createUser, createKey } =
            await githubAuth.validateCallback(code);
        const getUser = async () => {
            const existingUser = await getExistingUser();
            if (existingUser) return existingUser;
            if (!githubUser.email) {
                throw new AppError(
                    errorNames.validationError,
                    'Email not provided',
                    true,
                );
            }
            const [existingDatabaseUserWithEmail] = await db
                .select()
                .from(userTable)
                .where(eq(userTable.email, githubUser.email));
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
                    username: githubUser.login,
                    username_lower: githubUser.login.toLowerCase(),
                    email: githubUser.email,
                    email_verified: !!githubUser.email,
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
        errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};
