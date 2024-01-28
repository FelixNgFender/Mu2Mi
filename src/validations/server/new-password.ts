import { newPasswordSchemaClient } from '@/validations/client/new-password';
import 'server-cli-only';
import * as z from 'zod';

/**
 * For **server-side** validation. If you use async refinements, you must use the
 * `parseAsync` method to parse data! Otherwise Zod will throw an error.
 */
export const newPasswordSchemaServer = newPasswordSchemaClient;

export type NewPasswordSchemaServerType = z.infer<
    typeof newPasswordSchemaServer
>;
