import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// import * as schema from '../src/infra/schema';

if (!process.env.DATABASE_URL) {
    throw new Error('Database environment variables are not set');
}

const main = async () => {
    const db = drizzle(postgres(process.env.DATABASE_URL));
    // Delete assets and tracks older than 30 days
    await db.transaction(async (tx) => {
        // have to write raw SQL, careful to sync with table names in schema
        await tx.execute(sql`
            DELETE FROM asset
            WHERE updated_at < NOW() - INTERVAL '30 days'
            OR created_at < NOW() - INTERVAL '30 days'
        `);
        await tx.execute(sql`
            DELETE FROM track
            WHERE updated_at < NOW() - INTERVAL '30 days'
            OR created_at < NOW() - INTERVAL '30 days'
        `);
    });

    console.info(
        'Deleted all assets and tracks older than 30 days. Exiting...',
    );
    process.exit(0);
};

try {
    await main();
} catch (error) {
    console.error(error);
    process.exit(1);
}
