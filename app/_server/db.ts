import { stringToBoolean } from '@/lib/utils';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { type RedisClientType, createClient } from 'redis';

// const shutdownGracefully = async () => {
//     await queryClient.end();
//     if (globalThis.redisClient) await globalThis.redisClient.quit();
//     process.exit(0);
// };

// const signals: Record<string, number> = {
//     SIGINT: 2, // Ctrl+C
//     SIGTERM: 15, // default `kill` command
// };

// if (!globalThis.hasAddedShutdownListeners) {
//     Object.keys(signals).forEach((signal) => {
//         process.on(signal, async () => {
//             console.info(
//                 `Process received a ${signal} signal. Graceful shutdown `,
//                 new Date().toISOString(),
//             );
//             await shutdownGracefully();
//         });
//     });

//     globalThis.hasAddedShutdownListeners = true;
// }

export const queryClient = postgres(process.env.DATABASE_URL || '');
export const db: PostgresJsDatabase = drizzle(queryClient, {
    logger: stringToBoolean(process.env.APP_DEBUG),
});

const globalForRedis = global as unknown as { redisClient: RedisClientType };

export const redisClient =
    globalForRedis.redisClient ?? createClient({ url: process.env.REDIS_URL });

if (process.env.NODE_ENV === 'development') {
    globalForRedis.redisClient = redisClient;
}

if (!redisClient.isOpen) {
    redisClient
        .on('error', (err) => console.error('Redis Client Error', err))
        .on('ready', () => console.info('Redis Client Ready'))
        .connect();
}
// TODO: Potential memory leak here due to opening multiple database connections
