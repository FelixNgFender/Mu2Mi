import { db } from '@/src/server/db';
import { env } from '@/src/server/env';
import { AppError, errorNames } from '@/src/server/error';
import {
    emailVerification as emailVerificationTable,
    passwordReset as passwordResetTable,
} from '@/src/server/schema';
import { eq } from 'drizzle-orm';
import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import 'server-cli-only';

const TOKEN_DURATION_MS = env.TOKEN_DURATION_S * 1000;

export const generateEmailVerificationToken = async (userId: string) => {
    const storedUserTokens = await db
        .select()
        .from(emailVerificationTable)
        .where(eq(emailVerificationTable.userId, userId));
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
    await db.insert(emailVerificationTable).values({
        id: token,
        userId: userId,
        expires: new Date().getTime() + TOKEN_DURATION_MS,
    });

    return token;
};

export const validateEmailVerificationToken = async (token: string) => {
    const storedToken = await db.transaction(async (tx) => {
        const [storedToken] = await tx
            .select()
            .from(emailVerificationTable)
            .where(eq(emailVerificationTable.id, token));
        if (!storedToken)
            throw new AppError(
                errorNames.Application.TokenError,
                'Invalid token',
                true,
            );
        await tx
            .delete(emailVerificationTable)
            .where(eq(emailVerificationTable.userId, storedToken.userId));
        return storedToken;
    });
    const tokenExpires = Number(storedToken.expires); // bigint => number conversion
    if (!isWithinExpiration(tokenExpires)) {
        throw new AppError(
            errorNames.Application.TokenError,
            'Expired token',
            true,
        );
    }
    return storedToken.userId;
};

export const generatePasswordResetToken = async (userId: string) => {
    const storedUserTokens = await db
        .select()
        .from(passwordResetTable)
        .where(eq(passwordResetTable.userId, userId));
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
    await db.insert(passwordResetTable).values({
        id: token,
        userId: userId,
        expires: new Date().getTime() + TOKEN_DURATION_MS,
    });
    return token;
};

export const validatePasswordResetToken = async (token: string) => {
    const storedToken = await db.transaction(async (tx) => {
        const [storedToken] = await tx
            .select()
            .from(passwordResetTable)
            .where(eq(passwordResetTable.id, token));
        if (!storedToken)
            throw new AppError(
                errorNames.Application.TokenError,
                'Invalid token',
                true,
            );
        await tx
            .delete(passwordResetTable)
            .where(eq(passwordResetTable.id, storedToken.id));
        return storedToken;
    });
    const tokenExpires = Number(storedToken.expires); // bigint => number conversion
    if (!isWithinExpiration(tokenExpires)) {
        throw new AppError(
            errorNames.Application.TokenError,
            'Expired token',
            true,
        );
    }
    return storedToken.userId;
};
