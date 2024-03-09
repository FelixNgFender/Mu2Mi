import { siteConfig } from '@/config/site';
import { auth, githubAuth } from '@/lib/auth';
import { AppError, withErrorHandling } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import {
    createOne as createOneOAuthAccount,
    findOneByProvider as findOneOAuthAccountByProvider,
} from '@/models/oauth-account';
import {
    createOneWithOAuthAccount as createOneUserWithOAuthAccount,
    findOneByEmail as findOneUserByEmail,
} from '@/models/user';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(
    async (request: NextRequest) => {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const storedState = cookies().get('github_oauth_state')?.value ?? null;
        if (!code || !state || !storedState || state !== storedState) {
            return HttpResponse.badRequest();
        }
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

        const existingUserWithEmail = await findOneUserByEmail(
            githubUser.email,
        );
        if (existingUserWithEmail) {
            const existingOAuthAccount = await findOneOAuthAccountByProvider(
                'github',
                githubUser.id.toString(),
            );
            if (!existingOAuthAccount) {
                await createOneOAuthAccount({
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
                Location: siteConfig.paths.studio.home,
            });
        }

        const userId = generateId(15);

        await createOneUserWithOAuthAccount(
            {
                id: userId,
                email: githubUser.email.toLowerCase(),
                emailVerified: true,
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
            Location: siteConfig.paths.studio.home,
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

interface GitHubUser {
    id: number;
    email: string | null;
}
