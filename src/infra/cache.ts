import { env } from '@/config/env';
import { errorHandler } from '@/lib/error';
import { logger } from '@/lib/logger';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { type RedisClientType, createClient } from 'redis';
import 'server-only';

declare global {
    var cache: RedisClientType | undefined;
}

let cache: RedisClientType;

if (env.NODE_ENV === 'production') {
    cache = createClient({ url: env.REDIS_URL, disableOfflineQueue: true });
} else {
    if (!global.cache) {
        global.cache = createClient({
            url: env.REDIS_URL,
            disableOfflineQueue: true,
        });
    }

    cache = global.cache;
}

if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && !cache.isOpen) {
    cache
        .on('error', async (err) => {
            await errorHandler.handleError(err);
        })
        .on('ready', () => logger.info('Redis Client Ready'))
        .connect();
}

export { cache };
