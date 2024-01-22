import { env } from '@/config/env';
import { AppError, errorNames } from '@/lib/error';
import { emailVerificationModel } from '@/models/email-verification';
import { passwordResetModel } from '@/models/password-reset';
import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import 'server-cli-only';

const TOKEN_DURATION_MS = env.TOKEN_DURATION_S * 1000;

export const generateEmailVerificationToken = async (userId: string) => {
    const storedUserTokens =
        await emailVerificationModel.findManyByUserId(userId);
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token) => {
            // check if expiration is within 1 hour
            // and reuse the token if true
            return isWithinExpiration(
                Number(token.expires) - TOKEN_DURATION_MS / 2,
            );
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(63);
    await emailVerificationModel.createOne({
        id: token,
        userId: userId,
        expires: new Date().getTime() + TOKEN_DURATION_MS,
    });

    return token;
};

export const validateEmailVerificationToken = async (token: string) => {
    const storedToken =
        await emailVerificationModel.validateAndDeleteEmailVerificationToken(
            token,
        );
    const tokenExpires = Number(storedToken.expires); // bigint => number conversion
    if (!isWithinExpiration(tokenExpires)) {
        throw new AppError(errorNames.validationError, 'Expired token', true);
    }
    return storedToken.userId;
};

export const generatePasswordResetToken = async (userId: string) => {
    const storedUserTokens = await passwordResetModel.findManyByUserId(userId);
    if (storedUserTokens.length > 0) {
        const reusableStoredToken = storedUserTokens.find((token) => {
            // check if expiration is within 1 hour
            // and reuse the token if true
            return isWithinExpiration(
                Number(token.expires) - TOKEN_DURATION_MS / 2,
            );
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(63);
    await passwordResetModel.createOne({
        id: token,
        userId: userId,
        expires: new Date().getTime() + TOKEN_DURATION_MS,
    });
    return token;
};

export const validatePasswordResetToken = async (token: string) => {
    const storedToken =
        await passwordResetModel.validateAndDeletePasswordResetToken(token);
    const tokenExpires = Number(storedToken.expires); // bigint => number conversion
    if (!isWithinExpiration(tokenExpires)) {
        throw new AppError(errorNames.validationError, 'Expired token', true);
    }
    return storedToken.userId;
};
