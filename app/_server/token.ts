import { db } from '@/app/_server/db';
import {
    emailVerification as emailVerificationTable,
    passwordReset as passwordResetTable,
} from '@/app/_server/schema';
import { eq } from 'drizzle-orm';
import { generateRandomString, isWithinExpiration } from 'lucia/utils';

const TOKEN_EXPIRES_IN_MS =
    (Number(process.env.TOKEN_EXPIRES_IN_S) || 7200) * 1000;

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
                Number(token.expires) - TOKEN_EXPIRES_IN_MS / 2,
            );
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(63);
    await db.insert(emailVerificationTable).values({
        id: token,
        userId: userId,
        expires: new Date().getTime() + TOKEN_EXPIRES_IN_MS,
    });

    return token;
};

export const validateEmailVerificationToken = async (token: string) => {
    const storedToken = await db.transaction(async (tx) => {
        const [storedToken] = await tx
            .select()
            .from(emailVerificationTable)
            .where(eq(emailVerificationTable.id, token));
        if (!storedToken) throw new Error('Invalid token');
        await tx
            .delete(emailVerificationTable)
            .where(eq(emailVerificationTable.userId, storedToken.userId));
        return storedToken;
    });
    const tokenExpires = Number(storedToken.expires); // bigint => number conversion
    if (!isWithinExpiration(tokenExpires)) {
        throw new Error('Expired token');
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
                Number(token.expires) - TOKEN_EXPIRES_IN_MS / 2,
            );
        });
        if (reusableStoredToken) return reusableStoredToken.id;
    }
    const token = generateRandomString(63);
    await db.insert(passwordResetTable).values({
        id: token,
        userId: userId,
        expires: new Date().getTime() + TOKEN_EXPIRES_IN_MS,
    });
    return token;
};

export const validatePasswordResetToken = async (token: string) => {
    const storedToken = await db.transaction(async (tx) => {
        const [storedToken] = await tx
            .select()
            .from(passwordResetTable)
            .where(eq(passwordResetTable.id, token));
        if (!storedToken) throw new Error('Invalid token');
        await tx
            .delete(passwordResetTable)
            .where(eq(passwordResetTable.id, storedToken.id));
        return storedToken;
    });
    const tokenExpires = Number(storedToken.expires); // bigint => number conversion
    if (!isWithinExpiration(tokenExpires)) {
        throw new Error('Expired token');
    }
    return storedToken.userId;
};
