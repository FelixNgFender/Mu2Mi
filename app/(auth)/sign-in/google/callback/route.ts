import { auth, googleAuth } from '@/app/_server/auth';
import { db } from '@/app/_server/db';
import { user as userTable } from '@/app/_server/schema';
import { OAuthRequestError } from '@lucia-auth/oauth';
import { eq } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import type { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
    const storedState = cookies().get('google_oauth_state')?.value;
    const url = new URL(request.url);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    if (!storedState || !state || storedState !== state || !code) {
        return new Response(null, {
            status: 400,
        });
    }
    try {
        const { getExistingUser, googleUser, createUser, createKey } =
            await googleAuth.validateCallback(code);
        const getUser = async () => {
            const existingUser = await getExistingUser();
            if (existingUser) return existingUser;
            if (!googleUser.email_verified) {
                throw new Error('Email not verified');
            }
            if (!googleUser.email) {
                throw new Error('Email not provided');
            }
            const [existingDatabaseUserWithEmail] = await db
                .select()
                .from(userTable)
                .where(eq(userTable.email, googleUser.email));
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
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/',
            },
        });
    } catch (e) {
        if (e instanceof OAuthRequestError) {
            return new Response(null, {
                status: 400,
            });
        }
        return new Response(null, {
            status: 500,
        });
    }
};
