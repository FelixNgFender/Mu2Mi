import { emailVerificationModel } from '@/models/email-verification';
import { passwordResetModel } from '@/models/password-reset';
import { generateId } from 'lucia';
import { TimeSpan, createDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';
import 'server-only';

export const generateEmailVerificationCode = async (
    userId: string,
    email: string,
): Promise<string> => {
    await emailVerificationModel.deleteAllByUserId(userId);
    const code = generateRandomString(6, alphabet('0-9'));
    await emailVerificationModel.createOne({
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
    await passwordResetModel.deleteAllByUserId(userId);
    const tokenId = generateId(40);
    await passwordResetModel.createOne({
        id: tokenId,
        userId: userId,
        expiresAt: createDate(new TimeSpan(2, 'h')),
    });
    return tokenId;
};
