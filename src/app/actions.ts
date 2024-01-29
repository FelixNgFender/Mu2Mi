'use server';

import { auth, getUserSession } from '@/lib/auth';
import { httpStatus } from '@/lib/http';
import { ActionResult } from '@/types/server-action';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const signOut = async (): Promise<ActionResult> => {
    const { session } = await getUserSession();
    if (!session) {
        return {
            success: false,
            error: httpStatus.clientError.unauthorized.humanMessage,
        };
    }

    await auth.invalidateSession(session.id);

    const sessionCookie = auth.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    return redirect('/auth/sign-in');
};
