import { httpStatus } from '@/lib/http';
import { NextResponse } from 'next/server';

const { clientError, serverError } = httpStatus;

/**
 * Centralized HTTP responses.
 */
export class HttpResponse {
    static success(body?: Record<string, unknown>, headers?: HeadersInit) {
        return NextResponse.json(body || {}, {
            status: httpStatus.success.ok.code,
            headers,
        });
    }

    static redirect(body?: BodyInit, headers?: HeadersInit) {
        return new Response(body, {
            status: httpStatus.redirect.found.code,
            headers,
        });
    }

    static badRequest(error?: Record<string, unknown> | string) {
        return NextResponse.json(
            { message: clientError.badRequest.humanMessage, error },
            { status: clientError.badRequest.code },
        );
    }

    static unauthorized() {
        return NextResponse.json(
            { message: clientError.unauthorized.humanMessage },
            { status: clientError.unauthorized.code },
        );
    }

    static forbidden() {
        return NextResponse.json(
            { message: clientError.forbidden.humanMessage },
            { status: clientError.forbidden.code },
        );
    }

    static notFound() {
        return NextResponse.json(
            { message: clientError.notFound.humanMessage },
            { status: clientError.notFound.code },
        );
    }

    static tooManyRequests(headers?: HeadersInit) {
        return NextResponse.json(
            { message: clientError.tooManyRequests.humanMessage },
            { status: clientError.tooManyRequests.code, headers },
        );
    }

    static unprocessableEntity(error?: Record<string, unknown> | string) {
        return NextResponse.json(
            {
                message: clientError.unprocessableEntity.humanMessage,
                error,
            },
            { status: clientError.unprocessableEntity.code },
        );
    }

    static internalServerError() {
        return NextResponse.json(
            {
                message: serverError.internalServerError.humanMessage,
            },
            { status: serverError.internalServerError.code },
        );
    }
}
