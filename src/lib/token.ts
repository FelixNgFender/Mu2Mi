import {
    createOne as createOneEmailVerificationToken,
    deleteAllByUserId as deleteAllEmailVerificationTokensByUserId,
} from '@/models/email-verification';
import {
    createOne as createOnePasswordResetToken,
    deleteAllByUserId as deleteAllPasswordResetTokensByUserId,
} from '@/models/password-reset';
import { generateId } from 'lucia';
import { TimeSpan, createDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';
import 'server-only';

export const generateEmailVerificationCode = async (
    userId: string,
    email: string,
): Promise<string> => {
    await deleteAllEmailVerificationTokensByUserId(userId);
    const code = generateRandomString(6, alphabet('0-9'));
    await createOneEmailVerificationToken({
        userId,
        email,
        code,
        expiresAt: createDate(new TimeSpan(5, 'm')),
    });
    return code;
};

export const generatePasswordResetToken = async (
    userId: string,
): Promise<string> => {
    await deleteAllPasswordResetTokensByUserId(userId);
    const tokenId = generateId(40);
    await createOnePasswordResetToken({
        id: tokenId,
        userId: userId,
        expiresAt: createDate(new TimeSpan(2, 'h')),
    });
    return tokenId;
};
