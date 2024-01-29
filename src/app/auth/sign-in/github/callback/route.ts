import { auth, githubAuth } from '@/lib/auth';
import { AppError, errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { oAuthAccountModel } from '@/models/oauth-account';
import { userModel } from '@/models/user';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies().get('github_oauth_state')?.value ?? null;
    if (!code || !state || !storedState || state !== storedState) {
        return HttpResponse.badRequest();
    }
    try {
        const tokens = await githubAuth.validateAuthorizationCode(code);
        const githubUserResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const githubUser: GitHubUser = await githubUserResponse.json();
        if (!githubUser.email) {
            throw new AppError('ValidationError', 'Email not provided', true);
        }

        const existingUserWithEmail = await userModel.findOneByEmail(
            githubUser.email,
        );
        if (existingUserWithEmail) {
            const existingOAuthAccount =
                await oAuthAccountModel.findOneByProviderIdAndProviderUserId(
                    'github',
                    githubUser.id.toString(),
                );
            if (!existingOAuthAccount) {
                await oAuthAccountModel.createOne({
                    providerId: 'github',
                    providerUserId: githubUser.id.toString(),
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
                email: githubUser.email.toLowerCase(),
                emailVerified: true,
                username: githubUser.login,
                usernameLower: githubUser.login.toLowerCase(),
            },
            'github',
            githubUser.id.toString(),
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
    } catch (err) {
        if (err instanceof AppError) {
            return HttpResponse.unprocessableEntity(err.message);
        }
        if (err instanceof OAuth2RequestError) {
            return HttpResponse.badRequest();
        }
        await errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};

interface GitHubUser {
    id: number;
    login: string;
    email: string | null;
}
