import { AppError, errorNames } from '@/src/lib/error';
import { NextResponse } from 'next/server';

export type NextFunction = () => void;
export type Middleware = (
    request: Request,
    next: NextFunction,
) => Promise<NextResponse | void>;

export const handler =
    (...middleware: Middleware[]) =>
    async (request: Request) => {
        let result;

        for (let i = 0; i < middleware.length; i++) {
            let nextInvoked = false;

            const next = async () => {
                nextInvoked = true;
            };

            result = await middleware[i](request, next);

            if (!nextInvoked) {
                break;
            }
        }

        if (result) return result;

        throw new AppError(
            errorNames.Application.MiddlewareError,
            'Your handler or middleware must return a NextResponse!',
            true,
        );
    };
