import { HttpErrorCodes, httpStatus } from '@/lib/http';
import { logger } from '@/lib/logger';
import 'server-only';

export class AppError extends Error {
    public readonly name:
        | 'StartupError'
        | 'ValidationError'
        | 'FatalError'
        | 'HttpError';
    public readonly isOperational: boolean;
    public readonly httpCode?: HttpErrorCodes;

    constructor(
        name: 'StartupError' | 'ValidationError' | 'FatalError' | 'HttpError',
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
