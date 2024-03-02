import { auth, googleAuth } from '@/lib/auth';
import { AppError, withErrorHandling } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { oAuthAccountModel } from '@/models/oauth-account';
import { userModel } from '@/models/user';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const GET = withErrorHandling(
    async (request: NextRequest) => {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const storedState = cookies().get('google_oauth_state')?.value ?? null;
        const storedCodeVerifier =
            cookies().get('google_oauth_code_verifier')?.value ?? null;
        if (
            !code ||
            !state ||
            !storedState ||
            state !== storedState ||
            !storedCodeVerifier
        ) {
            return HttpResponse.badRequest();
        }
        const tokens = await googleAuth.validateAuthorizationCode(
            code,
            storedCodeVerifier,
        );
        const googleUserResponse = await fetch(
            'https://openidconnect.googleapis.com/v1/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                },
            },
        );
        const googleUser: GoogleUser = await googleUserResponse.json();
        if (!googleUser.email) {
            throw new AppError('ValidationError', 'Email not provided', true);
        }
        // Don't bother to verify unverified emails from Google with a verification code
        // Deny'em entry! 😎😎😎
        if (!googleUser.email_verified) {
            throw new AppError('ValidationError', 'Email not verified', true);
        }

        const existingUserWithEmail = await userModel.findOneByEmail(
            googleUser.email,
        );
        if (existingUserWithEmail) {
            const existingOAuthAccount =
                await oAuthAccountModel.findOneByProviderIdAndProviderUserId(
                    'facebook',
                    googleUser.sub,
                );
            if (!existingOAuthAccount) {
                await oAuthAccountModel.createOne({
                    providerId: 'facebook',
                    providerUserId: googleUser.sub,
                    userId: existingUserWithEmail.id,
                });
            }
            const session = await auth.createSession(
                existingUserWithEmail.id,
                {},
            );
            const sessionCookie = auth.createSessionCookie(session.id);
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes,
            );
            return HttpResponse.redirect(undefined, {
                Location: '/',
            });
        }

        const userId = generateId(15);

        await userModel.createOneWithOAuthAccount(
            {
                id: userId,
                email: googleUser.email.toLowerCase(),
                emailVerified: googleUser.email_verified,
                username: googleUser.name,
                usernameLower: googleUser.name.toLowerCase(),
            },
            'facebook',
            googleUser.sub,
        );

        const session = await auth.createSession(userId, {});
        const sessionCookie = auth.createSessionCookie(session.id);
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );
        return HttpResponse.redirect(undefined, {
            Location: '/',
        });
    },
    (err: Error) => {
        if (err instanceof AppError) {
            return HttpResponse.unprocessableEntity(err.message);
        }
        if (err instanceof OAuth2RequestError) {
            return HttpResponse.badRequest();
        }
    },
);

interface GoogleUser {
    sub: string;
    name: string;
    email: string;
    email_verified: boolean;
}
