export type SuccessHttpCode = 200;
export type RedirectHttpCode = 302;
export type ClientErrorHttpCode = 400 | 401 | 403 | 404 | 429;
export type ServerErrorHttpCode = 500;
export type HttpCode =
    | SuccessHttpCode
    | RedirectHttpCode
    | ClientErrorHttpCode
    | ServerErrorHttpCode;

export type SuccessHttpStatus = {
    OK: SuccessHttpCode;
};

export type RedirectHttpStatus = {
    Found: RedirectHttpCode;
};

export type ClientErrorHttpStatus = {
    BadRequest: ClientErrorHttpCode;
    Unauthorized: ClientErrorHttpCode;
    Forbidden: ClientErrorHttpCode;
    NotFound: ClientErrorHttpCode;
    TooManyRequests: ClientErrorHttpCode;
};

export type ServerErrorHttpStatus = {
    InternalServerError: ServerErrorHttpCode;
};

export const httpStatus: {
    Success: SuccessHttpStatus;
    Redirect: RedirectHttpStatus;
    ClientError: ClientErrorHttpStatus;
    ServerError: ServerErrorHttpStatus;
} = {
    Success: {
        OK: 200,
    },
    Redirect: {
        Found: 302,
    },
    ClientError: {
        BadRequest: 400,
        Unauthorized: 401,
        Forbidden: 403,
        NotFound: 404,
        TooManyRequests: 429,
    },
    ServerError: {
        InternalServerError: 500,
    },
};
