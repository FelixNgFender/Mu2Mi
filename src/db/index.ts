import { env } from '@/lib/env';
import { AppError, errorNames } from '@/lib/error';
import { logger } from '@/lib/logger';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Client as MinioClient } from 'minio';
import postgres from 'postgres';
import { type RedisClientType, createClient } from 'redis';
import 'server-cli-only';

import * as schema from './schema';

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
        .on('error', (err) => logger.error('Redis Client Error', err))
        .on('ready', () => logger.info('Redis Client Ready'))
        .connect();
}
// TODO: Potential memory leak here due to opening multiple database connections
// Still temporary solution
// Potential solution: move DB connection logic to Express custom server

const fileStorageClient = new MinioClient({
    endPoint: env.S3_ENDPOINT,
    port: env.S3_PORT,
    useSSL: env.S3_USE_SSL,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
});

(async () => {
    const exists = await fileStorageClient.bucketExists(env.S3_BUCKET_NAME);
    if (exists) {
        logger.info(`Bucket ${env.S3_BUCKET_NAME} exists.`);
    } else {
        throw new AppError(
            errorNames.startupError,
            `Bucket ${env.S3_BUCKET_NAME} does not exist.`,
            false,
        );
    }
})();

export { queryClient, db, redisClient, fileStorageClient };
