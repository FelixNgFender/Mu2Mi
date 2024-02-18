'use server';

import { auth } from '@/lib/auth';
import { authAction } from '@/lib/safe-action';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({});

export const signOut = authAction(schema, async ({}, { session }) => {
    await auth.invalidateSession(session.id);
    const sessionCookie = auth.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    return redirect('/auth/sign-in');
});
