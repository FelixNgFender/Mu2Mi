import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import 'server-cli-only';

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

        // Don't use `AppError` here because it's an error in development
        throw new Error(
            'Your handler or middleware must return a NextResponse!',
        );
    };
