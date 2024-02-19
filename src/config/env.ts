import 'server-only';
import { z } from 'zod';

const isString = z.string().min(1);
const isBoolean = isString.transform((value) => value === 'true');
const isNumber = isString.transform(Number);

const envSchema = z.object({
    // Node.js
    NODE_ENV: z.enum(['development', 'production', 'test']),

    // Express
    PROTOCOL: z.enum(['http', 'https']),
    APP_PORT: isNumber,
    HOST: isString,

    // General
    APP_LOGGING: isBoolean,
    LOG_LEVEL: z.enum([
        'error',
        'warn',
        'info',
        'http',
        'verbose',
        'debug',
        'silly',
    ]),
    ENABLE_EMAIL: isBoolean,
    AUTH_COOKIE_DURATION_S: isNumber,

    // Database
    DATABASE_LOGGING: isBoolean,
    DATABASE_URL: isString,
    REDIS_URL: isString,
    S3_ENDPOINT: isString,
    S3_PORT: isNumber,
    S3_USE_SSL: isBoolean,
    S3_ACCESS_KEY: isString,
    S3_SECRET_KEY: isString,
    S3_BUCKET_NAME: isString,
    S3_PRESIGNED_URL_EXPIRATION_S: isNumber,

    // Auth
    GOOGLE_CLIENT_ID: isString,
    GOOGLE_CLIENT_SECRET: isString,
    GOOGLE_REDIRECT_URI: isString,
    FACEBOOK_CLIENT_ID: isString,
    FACEBOOK_CLIENT_SECRET: isString,
    FACEBOOK_REDIRECT_URI: isString,
    GITHUB_CLIENT_ID: isString,
    GITHUB_CLIENT_SECRET: isString,

    // Replicate
    REPLICATE_API_TOKEN: isString,
    WEBHOOK_SECRET: isString,
    TRACK_SEPARATION_MODEL_VERSION: isString,
    MIDI_TRANSCRIPTION_MODEL_VERSION: isString,
    MUSICGEN_MODEL_VERSION: isString,
    RIFFUSION_MODEL_VERSION: isString,
});

/**
 * Centralized environment variables for the application.
 */
export let env: z.infer<typeof envSchema> & {
    // Derived properties
    readonly ORIGIN: string;
};

try {
    const parsedEnv = envSchema.parse(process.env);
    env = {
        ...parsedEnv,
        get ORIGIN() {
            return `${parsedEnv.PROTOCOL}://${parsedEnv.HOST}:${parsedEnv.APP_PORT}`;
        },
    };
} catch (err) {
    if (err instanceof z.ZodError) {
        const { fieldErrors } = err.flatten();
        const errorMessage = Object.entries(fieldErrors)
            .map(([field, errors]) =>
                errors ? `${field}: ${errors.join(', ')}` : field,
            )
            .join('\n  ');
        // Had to use console.error here because logger is not initialized yet (circular dependency)
        console.error(`Missing environment variables:\n  ${errorMessage}`);
        // Fail fast
        process.exit(1);
    }
}
