import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { Logger as DrizzleLogger } from 'drizzle-orm/logger';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'server-only';

import * as schema from './schema';

class DatabaseLogger implements DrizzleLogger {
    logQuery(query: string, params: unknown[]): void {
        logger.info(JSON.stringify({ query, params }));
    }
}

declare global {
    var db: PostgresJsDatabase<typeof schema> | undefined;
}

let db: PostgresJsDatabase<typeof schema>;

if (process.env.NODE_ENV === 'production') {
    db = drizzle(postgres(env.DATABASE_URL), {
        logger: env.DATABASE_LOGGING && new DatabaseLogger(),
        schema,
    });
} else {
    if (!global.db) {
        global.db = drizzle(postgres(env.DATABASE_URL), {
            logger: env.DATABASE_LOGGING && new DatabaseLogger(),
            schema,
        });
    }

    db = global.db;
}

export { db };
