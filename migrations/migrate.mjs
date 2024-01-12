import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
    // Don't need application-specific error handling
    throw new Error('DATABASE_URL environment variable is not set');
}

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(migrationClient);

// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: './migrations' });
// Don't forget to close the connection, otherwise the script will hang
await migrationClient.end();

// Meant to be run as a script so kill process after execution
process.exit(0);
