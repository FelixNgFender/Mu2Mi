import { env } from '@/config/env';
import { errorHandler } from '@/lib/error';
import { logger } from '@/lib/logger';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { type RedisClientType, createClient } from 'redis';
import 'server-only';

declare global {
    var redis: RedisClientType | undefined;
}

let redis: RedisClientType;

if (process.env.NODE_ENV === 'production') {
    redis = createClient({ url: env.REDIS_URL, disableOfflineQueue: true });
} else {
    if (!global.redis) {
        global.redis = createClient({
            url: env.REDIS_URL,
            disableOfflineQueue: true,
        });
    }

    redis = global.redis;
}

if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && !redis.isOpen) {
    redis
        .on('error', async (err) => {
            await errorHandler.handleError(err);
        })
        .on('ready', () => logger.info('Redis Client Ready'))
        .connect();
}

export { redis };
