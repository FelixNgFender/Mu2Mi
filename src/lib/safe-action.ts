import { getUserSession } from '@/models/user';
import { createSafeActionClient } from 'next-safe-action';

import { AppError, errorHandler } from './error';
import { httpStatus } from './http';

/**
 * Base client for type-safe Server Actions.
 */
export const action = createSafeActionClient({
    handleReturnedServerError(e) {
        if (e instanceof AppError) {
            return e.message;
        }
        return httpStatus.serverError.internalServerError.humanMessage;
    },
    async handleServerErrorLog(e) {
        await errorHandler.handleError(e);
    },
});

/**
 * Protected client for type-safe Server Actions. Handles authentication, error handling, and logging.
 */
export const authAction = createSafeActionClient({
    async middleware() {
        const { session, user } = await getUserSession();
        if (!user || !user.emailVerified) {
            throw new AppError(
                'HttpError',
                httpStatus.clientError.unauthorized.humanMessage,
                true,
                httpStatus.clientError.unauthorized.code,
            );
        }
        return { session, user };
    },
    handleReturnedServerError(e) {
        if (e instanceof AppError) {
            return e.message;
        }
        return httpStatus.serverError.internalServerError.humanMessage;
    },
    async handleServerErrorLog(e) {
        await errorHandler.handleError(e);
    },
});
