export const httpStatus = {
    success: {
        ok: 200,
    },
    redirect: {
        found: 302,
    },
    clientError: {
        badRequest: 400,
        unauthorized: 401,
        forbidden: 403,
        notFound: 404,
        tooManyRequests: 429,
        unprocessableEntity: 422,
    },
    serverError: {
        internalServerError: 500,
    },
} as const;
