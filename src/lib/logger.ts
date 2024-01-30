import { env } from '@/config/env';
import 'server-only';
import winston, { createLogger } from 'winston';

const { transports, format } = winston;
const { combine, colorize, simple, timestamp, json, errors, splat } = format;
const { Console } = transports;

/**
 * Centralized logger for the application.
 */
export const logger = createLogger({
    level: env.LOG_LEVEL,
    format: combine(timestamp(), errors({ stack: true }), splat(), json()),
    defaultMeta: { service: 'web' },
    // https://12factor.net/logs
    transports: [
        new Console({
            format: combine(colorize(), simple()),
        }),
    ],
    silent: !env.APP_LOGGING,
});
