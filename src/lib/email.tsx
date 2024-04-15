import PasswordResetEmail from '@/components/emails/password-reset';
import SignUpEmail from '@/components/emails/sign-up';
import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { logger } from '@/lib/logger';
import { SES } from '@aws-sdk/client-ses';
import { render } from '@react-email/render';
import 'server-only';

import { AppError } from './error';

let ses: SES;

if (
    env.ENABLE_EMAIL &&
    env.AWS_REGION &&
    env.AWS_ACCESS_KEY_ID &&
    env.AWS_SECRET_ACCESS_KEY
) {
    ses = new SES({
        region: env.AWS_REGION,
        credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
    });
} else if (
    env.ENABLE_EMAIL &&
    (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY)
) {
    throw new AppError(
        'StartupError',
        'Invalid AWS credentials for SES. Either disable email or provide AWS credentials.',
        false,
    );
}

export const sendEmailVerificationCode = async (
    email: string,
    code: string,
) => {
    if (!env.ENABLE_EMAIL) {
        logger.info(`
=======================================
New email received at: ${email}
Your email verification code is: ${code}
=======================================
        `);
        return;
    }

    try {
        await ses.sendEmail({
            Source: `\"${siteConfig.name}\" <${siteConfig.contact}>`,
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: render(<SignUpEmail verificationCode={code} />),
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Verify your email address',
                },
            },
        });
    } catch (error) {
        throw new AppError('AWSError', (error as Error).message, true);
    }
};

export const sendPasswordResetLink = async (email: string, token: string) => {
    const url = `${env.ORIGIN}${siteConfig.paths.auth.passwordReset}/${token}`;

    if (!env.ENABLE_EMAIL) {
        logger.info(`
=======================================
New email received at: ${email}
Your password reset link is: ${url}
=======================================
        `);
        return;
    }

    try {
        await ses.sendEmail({
            Source: `\"${siteConfig.name}\" <${siteConfig.contact}>`,
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: render(<PasswordResetEmail url={url} />),
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Reset your password',
                },
            },
        });
    } catch (error) {
        throw new AppError('AWSError', (error as Error).message, true);
    }
};
