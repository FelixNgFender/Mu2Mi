'use server';

import { siteConfig } from '@/config/site';
import { authAction } from '@/lib/safe-action';
import { updateOne as updateOneUser } from '@/models/user';
import { revalidatePath } from 'next/cache';

import { userFormSchema } from './schemas';

const schema = userFormSchema;

export const editProfile = authAction(schema, async (newUser, { user }) => {
    await updateOneUser(user.id, newUser);
    revalidatePath(siteConfig.paths.settings);
});
