// Kept in case we want to use SMTP instead of Postmark API in the future
// import { env } from '$env/dynamic/private';
// import { transporter } from './emailSetup';
// export const sendEmailVerificationLink = async (email: string, token: string) => {
// 	const url = `http://localhost:${env.PORT}/email-verification/${token}`;
// 	await transporter.sendMail({
// 		from: env.EMAIL_VERIFY,
// 		to: email,
// 		subject: 'Email Verification',
// 		text: `Click this link to verify your email: ${url}`,
// 		html: `<a href="${url}">Click this link to verify your email</a>`
// 	});
// };
// export const sendPasswordResetLink = async (email: string, token: string) => {
// 	const url = `http://localhost:${env.PORT}/password-reset/${token}`;
// 	await transporter.sendMail({
// 		from: env.EMAIL_VERIFY,
// 		to: email,
// 		subject: 'Password Reset',
// 		text: `Click this link to reset your password: ${url}`,
// 		html: `<a href="${url}">Click this link to reset your password</a>`
// 	});
// };
// import { ServerClient } from 'postmark';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import 'server-cli-only';

// const transporter = new ServerClient(env.POSTMARK_API_KEY);

export const sendEmailVerificationLink = async (
    email: string,
    token: string,
) => {
    const url = `${env.ORIGIN}/auth/email-verification/${token}`;

    if (!env.ENABLE_EMAIL) {
        logger.info(`
=======================================
New email received at: ${email}
Your email verification link is: ${url}
=======================================
        `);
        return;
    }

    // transporter.sendEmail({
    //     From: env.EMAIL_VERIFY,
    //     To: email,
    //     Subject: 'Email Verification',
    //     TextBody: `Click this link to verify your email: ${url}`,
    //     HtmlBody: `<a href="${url}">Click this link to verify your email</a>`,
    //     MessageStream: env.POSTMARK_MESSAGE_STREAM,
    //     Tag: 'email-verification',
    // });
};

export const sendPasswordResetLink = async (email: string, token: string) => {
    const url = `${env.ORIGIN}/auth/password-reset/${token}`;

    if (!env.ENABLE_EMAIL) {
        logger.info(`
=======================================
New email received at: ${email}
Your password reset link is: ${url}
=======================================
        `);
        return;
    }

    // transporter.sendEmail({
    //     From: env.EMAIL_VERIFY,
    //     To: email,
    //     Subject: 'Password Reset',
    //     TextBody: `Click this link to reset your password: ${url}`,
    //     HtmlBody: `<a href="${url}">Click this link to reset your password</a>`,
    //     MessageStream: env.POSTMARK_MESSAGE_STREAM,
    //     Tag: 'password-reset',
    // });
};