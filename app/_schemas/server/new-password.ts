import { newPasswordSchemaClient } from '@/app/_schemas/client/new-password';
import * as z from 'zod';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
export const newPasswordSchemaServer = newPasswordSchemaClient;

export type newPasswordSchemaServerType = z.infer<
    typeof newPasswordSchemaServer
>;
