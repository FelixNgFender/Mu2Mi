import { httpStatus } from '@/lib/http';
import { NextResponse } from 'next/server';
import 'server-cli-only';

const { clientError, serverError } = httpStatus;

/**
 * Centralized HTTP responses.
 */
export class HttpResponse {
    static success(body?: Record<string, unknown>, headers?: HeadersInit) {
        return NextResponse.json(body || {}, {
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
            { message: "Oops! We couldn't understand your request.", error },
            { status: clientError.badRequest },
        );
    }

    static unauthorized() {
        return NextResponse.json(
            { message: 'Sorry, you need to be signed in to do that.' },
            { status: clientError.unauthorized },
        );
    }

    static forbidden() {
        return NextResponse.json(
            { message: "Sorry, you don't have permission to access this." },
            { status: clientError.forbidden },
        );
    }

    static notFound() {
        return NextResponse.json(
            { message: "Sorry, we couldn't find what you were looking for." },
            { status: clientError.notFound },
        );
    }

    static tooManyRequests(headers?: HeadersInit) {
        return NextResponse.json(
            { message: "You're doing that too much. Please slow down." },
            { status: clientError.tooManyRequests, headers },
        );
    }

    static unprocessableEntity(error?: Record<string, unknown> | string) {
        return NextResponse.json(
            {
                message: "Oops! We couldn't process your request.",
                error,
            },
            { status: clientError.unprocessableEntity },
        );
    }

    static internalServerError() {
        return NextResponse.json(
            {
                message:
                    "Oops! Something went wrong on our end. We're looking into it.",
            },
            { status: serverError.internalServerError },
        );
    }
}
