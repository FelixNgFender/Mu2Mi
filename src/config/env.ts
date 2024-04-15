import 'server-only';
import { z } from 'zod';

const isString = z.string().min(1);
const isBoolean = isString.transform((value) => value === 'true');
const isNumber = isString.transform(Number);

const envSchema = z.object({
    // General
    NEXT_MANUAL_SIG_HANDLE: isBoolean,
    PROTOCOL: z.enum(['http', 'https']),
    HOST: isString,
    APP_PORT: isNumber,

    // Authentication
    AUTH_COOKIE_DURATION_S: isNumber,
    GOOGLE_CLIENT_ID: isString,
    GOOGLE_CLIENT_SECRET: isString,
    GOOGLE_REDIRECT_URI: isString,
    // FACEBOOK_CLIENT_ID: isString,
    // FACEBOOK_CLIENT_SECRET: isString,
    // FACEBOOK_REDIRECT_URI: isString,
    GITHUB_CLIENT_ID: isString,
    GITHUB_CLIENT_SECRET: isString,

    // Logging
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

    // Rate limiting
    ENABLE_RATE_LIMIT: isBoolean,

    // Captcha
    NEXT_PUBLIC_ENABLE_CAPTCHA: isBoolean.optional(),
    NEXT_PUBLIC_CAPTCHA_SITE_KEY: isString.optional(),
    CAPTCHA_SECRET_KEY: isString.optional(),

    // Email
    ENABLE_EMAIL: isBoolean,
    AWS_REGION: isString.optional(),
    AWS_ACCESS_KEY_ID: isString.optional(),
    AWS_SECRET_ACCESS_KEY: isString.optional(),

    // Analytics
    ENABLE_ANALYTICS: isBoolean,
    UMAMI_SCRIPT_URL: isString.optional(),
    UMAMI_ANALYTICS_ID: isString.optional(),

    // Database
    DATABASE_LOGGING: isBoolean,
    DATABASE_URL: isString,
    REDIS_URL: isString,

    // S3
    S3_ENDPOINT: isString,
    S3_PORT: isNumber,
    S3_USE_SSL: isBoolean,
    S3_ACCESS_KEY: isString,
    S3_SECRET_KEY: isString,
    S3_BUCKET_NAME: isString,
    S3_PRESIGNED_URL_EXPIRATION_S: isNumber,

    // Replicate
    REPLICATE_API_TOKEN: isString,
    REPLICATE_WEBHOOK_SECRET: isString,
    MUSIC_GENERATION_MODEL_VERSION: isString,
    STYLE_REMIX_MODEL_VERSION: isString,
    TRACK_SEPARATION_MODEL_VERSION: isString,
    TRACK_ANALYSIS_MODEL_VERSION: isString,
    MIDI_TRANSCRIPTION_MODEL_VERSION: isString,
    LYRICS_TRANSCRIPTION_MODEL_VERSION: isString,
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
