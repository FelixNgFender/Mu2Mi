import { env } from '@/config/env';
import { errorHandler } from '@/lib/error';
import { logger } from '@/lib/logger';
import { DrizzleLogger } from 'drizzle-orm/logger';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { Client as MinioClient } from 'minio';
import postgres from 'postgres';
import { type RedisClientType, createClient } from 'redis';
import 'server-only';

import * as schema from './schema';

class DatabaseLogger implements DrizzleLogger {
    logQuery(query: string, params: unknown[]): void {
        logger.info(JSON.stringify({ query, params }));
    }
}

declare global {
    var db: PostgresJsDatabase<typeof schema> | undefined;
    var redisClient: RedisClientType | undefined;
}

let db: PostgresJsDatabase<typeof schema>;
let redisClient: RedisClientType;

if (env.NODE_ENV === 'production') {
    db = drizzle(postgres(env.DATABASE_URL), {
        logger: env.DATABASE_LOGGING && new DatabaseLogger(),
        schema,
    });
    redisClient = createClient({ url: env.REDIS_URL });
} else {
    if (!global.db) {
        global.db = drizzle(postgres(env.DATABASE_URL), {
            logger: env.DATABASE_LOGGING && new DatabaseLogger(),
            schema,
        });
    }
    if (!global.redisClient) {
        global.redisClient = createClient({ url: env.REDIS_URL });
    }

    db = global.db;
    redisClient = global.redisClient;
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

export { db, redisClient, fileStorageClient };
