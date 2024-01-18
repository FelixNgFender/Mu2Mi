import { httpStatus } from '@/lib/http';
import { NextResponse } from 'next/server';
import 'server-cli-only';

const { clientError, serverError } = httpStatus;

/**
 * Centralized HTTP responses.
 */
export class HttpResponse {
    static success(body?: Record<string, unknown>, headers?: HeadersInit) {
        return NextResponse.json(body, {
            status: httpStatus.success.ok,
            headers,
        });
    }

    static redirect(body?: BodyInit, headers?: HeadersInit) {
        return new Response(body, {
            status: httpStatus.redirect.found,
            headers,
        });
    }

    static badRequest(error?: Record<string, unknown> | string) {
        return NextResponse.json(
            { message: 'Bad request', error },
            { status: clientError.badRequest },
        );
    }

    static unauthorized() {
        return NextResponse.json(
            { message: 'Unauthorized' },
            { status: clientError.unauthorized },
        );
    }

    static forbidden() {
        return NextResponse.json(
            { message: 'Forbidden' },
            { status: clientError.forbidden },
        );
    }

    static notFound() {
        return NextResponse.json(
            { message: 'Not found' },
            { status: clientError.notFound },
        );
    }

    static tooManyRequests(headers?: HeadersInit) {
        return NextResponse.json(
            { message: 'Too many requests' },
            { status: clientError.tooManyRequests, headers },
        );
    }

    static unprocessableEntity(error?: Record<string, unknown> | string) {
        return NextResponse.json(
            {
                message: 'Unprocessable entity',
                error,
            },
            { status: clientError.unprocessableEntity },
        );
    }

    static internalServerError() {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: serverError.internalServerError },
        );
    }
}
