'use server';

import { auth, getUserSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface ActionResult {
    error: string | null;
}

export const signOut = async (): Promise<ActionResult> => {
    const { session } = await getUserSession();
    if (!session) {
        return {
            error: 'Unauthorized',
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
