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
import { stringToBoolean } from '@/lib/utils';

// const transporter = new ServerClient(process.env.POSTMARK_API_KEY);

export const sendEmailVerificationLink = async (
    email: string,
    token: string,
) => {
    const url = `${process.env.ORIGIN}/email-verification/${token}`;

    if (!stringToBoolean(process.env.ENABLE_EMAIL)) {
        console.log('====================================');
        console.log('New email received at: ', email);
        console.log('Your email verification link is: ', `${url}`);
        console.log('====================================');
        return;
    }

    // transporter.sendEmail({
    //     From: process.env.EMAIL_VERIFY,
    //     To: email,
    //     Subject: 'Email Verification',
    //     TextBody: `Click this link to verify your email: ${url}`,
    //     HtmlBody: `<a href="${url}">Click this link to verify your email</a>`,
    //     MessageStream: process.env.POSTMARK_MESSAGE_STREAM,
    //     Tag: 'email-verification',
    // });
};

export const sendPasswordResetLink = async (email: string, token: string) => {
    const url = `${process.env.ORIGIN}/password-reset/${token}`;

    if (!stringToBoolean(process.env.ENABLE_EMAIL)) {
        console.log('====================================');
        console.log('New email received at: ', email);
        console.log('Your password reset link is: ', `${url}`);
        console.log('====================================');
        return;
    }

    // transporter.sendEmail({
    //     From: process.env.EMAIL_VERIFY,
    //     To: email,
    //     Subject: 'Password Reset',
    //     TextBody: `Click this link to reset your password: ${url}`,
    //     HtmlBody: `<a href="${url}">Click this link to reset your password</a>`,
    //     MessageStream: env.POSTMARK_MESSAGE_STREAM,
    //     Tag: 'password-reset',
    // });
};
