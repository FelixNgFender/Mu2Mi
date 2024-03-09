// import { siteConfig } from '@/config/site';
// import { auth, facebookAuth } from '@/lib/auth';
// import { AppError, withErrorHandling } from '@/lib/error';
// import { HttpResponse } from '@/lib/response';
// import {
//     createOne as createOneOAuthAccount,
//     findOneByProvider as findOneOAuthAccountByProvider,
// } from '@/models/oauth-account';
// import {
//     createOneWithOAuthAccount as createOneUserWithOAuthAccount,
//     findOneByEmail as findOneUserByEmail,
// } from '@/models/user';
// import { OAuth2RequestError } from 'arctic';
// import { generateId } from 'lucia';
// import { cookies } from 'next/headers';
// import type { NextRequest } from 'next/server';

// export const dynamic = 'force-dynamic';

// export const GET = withErrorHandling(
//     async (request: NextRequest) => {
//         const url = new URL(request.url);
//         const code = url.searchParams.get('code');
//         const state = url.searchParams.get('state');
//         const storedState =
//             cookies().get('facebook_oauth_state')?.value ?? null;
//         if (!code || !state || !storedState || state !== storedState) {
//             return HttpResponse.badRequest();
//         }
//         const tokens = await facebookAuth.validateAuthorizationCode(code);
//         const fields = ['id', 'name', 'email'].join(',');
//         const facebookUserResponse = await fetch(
//             `https://graph.facebook.com/me?fields=${fields}&access_token=${tokens.accessToken}`,
//         );
//         const facebookUser: FacebookUser = await facebookUserResponse.json();

//         // Facebook doesn't return unverified emails
//         // We just simply doesn't allow users to sign in with Facebook
//         // if they don't have a verified email or their Facebook account doesn't have an email
//         if (!facebookUser.email) {
//             throw new AppError('ValidationError', 'Email not provided', true);
//         }
//         const existingUserWithEmail = await findOneUserByEmail(
//             facebookUser.email,
//         );
//         if (existingUserWithEmail) {
//             const existingOAuthAccount = await findOneOAuthAccountByProvider(
//                 'facebook',
//                 facebookUser.id,
//             );
//             if (!existingOAuthAccount) {
//                 await createOneOAuthAccount({
//                     providerId: 'facebook',
//                     providerUserId: facebookUser.id,
//                     userId: existingUserWithEmail.id,
//                 });
//             }
//             const session = await auth.createSession(
//                 existingUserWithEmail.id,
//                 {},
//             );
//             const sessionCookie = auth.createSessionCookie(session.id);
//             cookies().set(
//                 sessionCookie.name,
//                 sessionCookie.value,
//                 sessionCookie.attributes,
//             );
//             return HttpResponse.redirect(undefined, {
//                 Location: siteConfig.paths.studio.home,
//             });
//         }

//         const userId = generateId(15);

//         await createOneUserWithOAuthAccount(
//             {
//                 id: userId,
//                 email: facebookUser.email.toLowerCase(),
//                 emailVerified: true,
//             },
//             'facebook',
//             facebookUser.id,
//         );

//         const session = await auth.createSession(userId, {});
//         const sessionCookie = auth.createSessionCookie(session.id);
//         cookies().set(
//             sessionCookie.name,
//             sessionCookie.value,
//             sessionCookie.attributes,
//         );
//         return HttpResponse.redirect(undefined, {
//             Location: siteConfig.paths.studio.home,
//         });
//     },
//     (err: Error) => {
//         if (err instanceof AppError) {
//             return HttpResponse.unprocessableEntity(err.message);
//         }
//         if (err instanceof OAuth2RequestError) {
//             return HttpResponse.badRequest();
//         }
//     },
// );

// interface FacebookUser {
//     id: string;
//     email?: string;
// }
