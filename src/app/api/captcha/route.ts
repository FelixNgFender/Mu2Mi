import { env } from '@/config/env';
import { withErrorHandling } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile';

const verifyEndpoint =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Secret key	Description
// 1x0000000000000000000000000000000AA	Always passes
// 2x0000000000000000000000000000000AA	Always fails
// 3x0000000000000000000000000000000AA	Yields a “token already spent” error

const secret = env.CAPTCHA_SECRET_KEY || '1x0000000000000000000000000000000AA';

export const POST = withErrorHandling(async (request: Request) => {
    const { token } = (await request.json()) as { token: string };

    const res = await fetch(verifyEndpoint, {
        method: 'POST',
        body: `secret=${encodeURIComponent(
            secret,
        )}&response=${encodeURIComponent(token)}`,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
    });

    const data = (await res.json()) as TurnstileServerValidationResponse;

    return new Response(JSON.stringify(data), {
        status: data.success
            ? httpStatus.success.ok.code
            : httpStatus.clientError.badRequest.code,
        headers: {
            'content-type': 'application/json',
        },
    });
});
