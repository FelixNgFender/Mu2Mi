import { z } from 'zod';

const isString = z.string().min(1);
const isBoolean = isString.transform((value) => value === 'true');
const isNumber = isString.transform(Number);

const envSchema = z.object({
    // General
    ORIGIN: isString,
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
    TOKEN_DURATION_S: isNumber,
    AUTH_COOKIE_DURATION_S: isNumber,
    DEVICE_COOKIE_DURATION_S: isNumber,
    TIMEOUT_DURATION_S: isNumber,

    // Database
    DATABASE_LOGGING: isBoolean,
    DATABASE_URL: isString,
    REDIS_URL: isString,

    // Auth
    GOOGLE_CLIENT_ID: isString,
    GOOGLE_CLIENT_SECRET: isString,
    GOOGLE_REDIRECT_URI: isString,
    FACEBOOK_CLIENT_ID: isString,
    FACEBOOK_CLIENT_SECRET: isString,
    FACEBOOK_REDIRECT_URI: isString,
});

/**
 * Centralized environment variables for the application.
 */
export let env: z.infer<typeof envSchema>;

try {
    env = envSchema.parse(process.env);
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
