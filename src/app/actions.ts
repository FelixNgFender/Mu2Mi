'use server';

import { auth, getUserSession } from '@/lib/auth';
import { AppError } from '@/lib/error';
import { httpStatus } from '@/lib/http';
import { action } from '@/lib/safe-action';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({});

export const signOut = action(schema, async () => {
    const { session } = await getUserSession();
    if (!session) {
        throw new AppError(
            'HttpError',
            httpStatus.clientError.unauthorized.humanMessage,
            true,
            httpStatus.clientError.unauthorized.code,
        );
    }
    await auth.invalidateSession(session.id);
    const sessionCookie = auth.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    return redirect('/auth/sign-in');
});
