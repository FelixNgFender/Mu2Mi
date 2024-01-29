import { signedUrlBodySchemaClient } from '@/validations/client/asset';
import 'server-cli-only';
import { z } from 'zod';

/**
 * For server-side validation.
 */
export const signedUrlBodySchemaServer = signedUrlBodySchemaClient;

export type SignedUrlBodySchemaServerType = z.infer<
    typeof signedUrlBodySchemaServer
>;
