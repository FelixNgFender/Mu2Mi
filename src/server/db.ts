import { env } from '@/src/server/env';
import { logger } from '@/src/server/logger';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { type RedisClientType, createClient } from 'redis';
import 'server-cli-only';

export const queryClient = postgres(env.DATABASE_URL);
export const db: PostgresJsDatabase = drizzle(queryClient, {
    logger: env.DATABASE_LOGGING,
});

const globalForRedis = global as unknown as { redisClient: RedisClientType };

export const redisClient =
    globalForRedis.redisClient ?? createClient({ url: env.REDIS_URL });

if (env.NODE_ENV === 'development') {
    globalForRedis.redisClient = redisClient;
}

if (!redisClient.isOpen) {
    redisClient
        .on('error', (err) => logger.error('Redis Client Error', err))
        .on('ready', () => logger.info('Redis Client Ready'))
        .connect();
}
// TODO: Potential memory leak here due to opening multiple database connections
// Still temporary solution
// Potential solution: move DB connection logic to Express custom server
