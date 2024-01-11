import {
    type ClientErrorHttpCode,
    type ServerErrorHttpCode,
    httpStatus,
} from '@/src/lib/http';

type ApplicationErrorNames = {
    [key in keyof typeof applicationErrorNames]: string;
};

type HttpErrorNames = {
    [key in keyof typeof httpErrorNames]: {
        [innerKey: string]: string;
    };
};

const applicationErrorNames = {
    OAuthError: 'OAuthError',
    MiddlewareError: 'MiddlewareError',
    TokenError: 'TokenError',
};

const httpErrorNames = Object.entries(httpStatus)
    .filter(([key]) => key === 'ClientError' || key === 'ServerError')
    .reduce(
        (acc, [key, value]) => {
            acc[key] = Object.keys(value).reduce(
                (innerAcc, innerKey) => {
                    innerAcc[innerKey] = `Http${innerKey}`;
                    return innerAcc;
                },
                {} as Record<string, string>,
            );
            return acc;
        },
        {} as Record<string, Record<string, string>>,
    );

export const errorNames: {
    Application: ApplicationErrorNames;
    Http: HttpErrorNames;
} = {
    Application: {
        ...applicationErrorNames,
    },
    Http: {
        ...httpErrorNames,
    },
};

/**
 * Centralized error handler
 */
export class AppError extends Error {
    public readonly name: string;
    public readonly isOperational: boolean;

    constructor(
        name: string,
        message: string | undefined,
        isOperational: boolean,
    ) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

        this.name = name;
        this.isOperational = isOperational;

        Error.captureStackTrace(this);
    }
}

export class HttpError extends AppError {
    public readonly httpCode: ClientErrorHttpCode | ServerErrorHttpCode;

    constructor(
        name: string,
        httpCode: ClientErrorHttpCode | ServerErrorHttpCode,
        message: string | undefined,
        isOperational: boolean,
    ) {
        super(name, message, isOperational);

        this.httpCode = httpCode;
    }
}
