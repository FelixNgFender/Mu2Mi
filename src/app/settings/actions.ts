'use server';

import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { fileStorage } from '@/infra';
import { auth } from '@/lib/auth';
import { authAction } from '@/lib/safe-action';
import { findManyByUserId as findManyAssetsByUserId } from '@/models/asset';
import { deleteOne as deleteOneUser } from '@/models/user';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({});

export const deleteAccount = authAction(schema, async ({}, { user }) => {
    // Don't need to invalidate the session, since the session table has a
    // cascade delete on the user id. This will automatically delete the
    // session when the user is deleted.
    const sessionCookie = auth.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
    );
    const assets = await findManyAssetsByUserId(user.id);
    await Promise.all([
        fileStorage.removeObjects(
            env.S3_BUCKET_NAME,
            assets.map((asset) => asset.name),
        ),
        deleteOneUser(user.id),
    ]);
    return redirect(siteConfig.paths.auth.signIn);
});
