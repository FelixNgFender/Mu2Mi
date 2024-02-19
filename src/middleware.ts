import { HttpResponse } from '@/lib/response';
import { verifyRequestOrigin } from 'lucia';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
    // CSRF protection for Route Handlers
    if (request.method === 'GET') {
        return NextResponse.next();
    }
    const originHeader = request.headers.get('Origin');
    // NOTE: You may need to use `X-Forwarded-Host` instead
    const hostHeader = request.headers.get('Host');
    if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
        return HttpResponse.forbidden();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
