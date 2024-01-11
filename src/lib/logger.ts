import { env } from '@/src/lib/env';
import winston, { createLogger } from 'winston';

const { transports, format } = winston;
const { combine, colorize, simple, timestamp, json } = format;
const { Console } = transports;

/**
 * Centralized logger for the application.
 */
export const logger = createLogger({
    level: env.LOG_LEVEL,
    format: combine(timestamp(), json()),
    defaultMeta: { service: 'mu2mi' },
    // TODO: Add transports
    // transports: [
    //     new transports.File({ filename: 'error.log', level: 'error' }),
    //     new transports.File({ filename: 'combined.log' }),
    // ],
    silent: !env.APP_LOGGING,
});

if (process.env.NODE_ENV === 'development') {
    logger.add(
        new Console({
            format: combine(colorize(), simple()),
        }),
    );
}
