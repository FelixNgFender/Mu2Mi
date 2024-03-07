import { HttpErrorCodes } from '@/lib/http';
import { logger } from '@/lib/logger';
import 'server-only';

import { HttpResponse } from './response';

export class AppError extends Error {
    public readonly name:
        | 'StartupError'
        | 'ValidationError'
        | 'FatalError'
        | 'HttpError'
        | 'AWSError'
        | 'ReplicateError';
    public readonly isOperational: boolean;
    public readonly httpCode?: HttpErrorCodes;

    constructor(
        name:
            | 'StartupError'
            | 'ValidationError'
            | 'FatalError'
            | 'HttpError'
            | 'AWSError'
            | 'ReplicateError',
        message: string | undefined,
        isOperational: boolean,
        httpCode?: HttpErrorCodes,
    ) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

        this.name = name;
        this.isOperational = isOperational;
        this.httpCode = httpCode;

        Error.captureStackTrace(this);
    }
}

class ErrorHandler {
    isTrustedError(error: Error) {
        if (error instanceof AppError) return error.isOperational;
        return false;
    }

    crashIfUntrustedError = async (error: Error) => {
        if (!this.isTrustedError(error)) {
            process.exit(1);
        }
    };

    /**
     * Handle errors. In case you are using this inside route handlers, you also need to return a response to the client afterwards.
     */
    public async handleError(error: Error): Promise<void> {
        logger.error(error);
        // await sendMailToAdminIfCritical();
        // await saveInOpsQueueIfCritical();
        // await determineIfOperationalError();
        // await fireMonitoringMetric(error);
        await this.crashIfUntrustedError(error);
    }
}

/**
 * Centralized error handler
 */
export const errorHandler = new ErrorHandler();

/**
 * For wrapping a Route Handler with error handling.
 *
 * @param handler The route handler
 * @param customErrorHandler A custom error handler, should return `undefined` if it doesn't handle the error.
 */
export const withErrorHandling = (
    handler: Function,
    customErrorHandler?: Function,
) => {
    return async (...args: any[]) => {
        try {
            return await handler(...args);
        } catch (err) {
            if (customErrorHandler) {
                const customResponse = customErrorHandler(err);
                if (customResponse) {
                    return customResponse;
                }
            }
            await errorHandler.handleError(err as Error);
            return HttpResponse.internalServerError();
        }
    };
};
