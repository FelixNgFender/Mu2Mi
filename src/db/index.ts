import { env } from '@/config/env';
import { errorHandler } from '@/lib/error';
import { logger } from '@/lib/logger';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Client as MinioClient } from 'minio';
import postgres from 'postgres';
import { type RedisClientType, createClient } from 'redis';
import 'server-only';

import * as schema from './schema';

// TODO: PostgresError: sorry, too many clients already
const queryClient = postgres(env.DATABASE_URL);
const db = drizzle(queryClient, {
    logger: env.DATABASE_LOGGING,
    schema,
});

const globalForRedis = global as unknown as { redisClient: RedisClientType };

const redisClient =
    globalForRedis.redisClient ?? createClient({ url: env.REDIS_URL });

if (env.NODE_ENV === 'development') {
    globalForRedis.redisClient = redisClient;
}

if (!redisClient.isOpen) {
    redisClient
        .on('error', async (err) => {
            await errorHandler.handleError(err);
        })
        .on('ready', () => logger.info('Redis Client Ready'))
        .connect();
}

const fileStorageClient = new MinioClient({
    endPoint: env.S3_ENDPOINT,
    port: env.S3_PORT,
    useSSL: env.S3_USE_SSL,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
});

export { queryClient, db, redisClient, fileStorageClient };
