import type { Config } from 'drizzle-kit';

export default {
    schema: './src/infra/schema.ts',
    out: './migrations',
    driver: 'pg', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
    dbCredentials: {
        // we don't use app-wide `env` here because of it meant to be
        // run script-wise
        connectionString: process.env.DATABASE_URL as string,
    },
    verbose: true,
    strict: true,
} satisfies Config;
