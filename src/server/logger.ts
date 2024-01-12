import { env } from '@/server/env';
import 'server-cli-only';
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
    defaultMeta: { service: 'web' },
    // TODO: Add proper transports
    transports: [
        new transports.File({
            filename: 'error.log',
            level: 'error',
            dirname: 'logs',
        }),
        new transports.File({ filename: 'combined.log', dirname: 'logs' }),
        ...(env.NODE_ENV === 'development'
            ? [
                  new Console({
                      format: combine(colorize(), simple()),
                  }),
              ]
            : []),
    ],
    silent: !env.APP_LOGGING,
});
