// import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as Minio from 'minio';
import postgres from 'postgres';

// import * as schema from '../src/infra/schema';

if (
    !process.env.DATABASE_URL ||
    !process.env.S3_ENDPOINT ||
    !process.env.S3_PORT ||
    !process.env.S3_USE_SSL ||
    !process.env.S3_ACCESS_KEY ||
    !process.env.S3_SECRET_KEY ||
    !process.env.S3_BUCKET_NAME
) {
    throw new Error('S3 and database environment variables are not set');
}

const main = async () => {
    const db = drizzle(postgres(process.env.DATABASE_URL));
    const fileStorage = new Minio.Client({
        endPoint: process.env.S3_ENDPOINT,
        port: parseInt(process.env.S3_PORT, 10),
        useSSL: 'true' === process.env.S3_USE_SSL,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
    });

    const exists = await fileStorage.bucketExists(process.env.S3_BUCKET_NAME);
    if (exists) {
        console.info(`Bucket ${process.env.S3_BUCKET_NAME} exists.`);
        fileStorage.removeObjects;
    } else {
        throw new Error(`Bucket ${process.env.S3_BUCKET_NAME} does not exist`);
    }

    // Remove all objects from the bucket
    const objectsStream = fileStorage.listObjects(process.env.S3_BUCKET_NAME);
    const incompleteUploadsStream = fileStorage.listIncompleteUploads(
        process.env.S3_BUCKET_NAME,
    );
    const objectNames = [];
    const incompleteUploadNames = [];
    objectsStream.on('data', (obj) => {
        if (obj.name) {
            objectNames.push(obj.name);
        }
    });
    objectsStream.on('error', (error) => {
        console.error(error);
    });
    objectsStream.on('end', async () => {
        console.log(
            `Removing ${objectNames.length} objects from bucket ${process.env.S3_BUCKET_NAME}`,
        );
        await fileStorage.removeObjects(
            process.env.S3_BUCKET_NAME,
            objectNames,
        );
        console.log(
            `Removed ${objectNames.length} objects from bucket ${process.env.S3_BUCKET_NAME}`,
        );
    });
    incompleteUploadsStream.on('data', (obj) => {
        incompleteUploadNames.push(obj.key);
    });
    incompleteUploadsStream.on('error', (error) => {
        console.error(error);
    });
    incompleteUploadsStream.on('end', async () => {
        console.log(
            `Removing ${incompleteUploadNames.length} incomplete uploads from bucket ${process.env.S3_BUCKET_NAME}`,
        );
        for (const name of incompleteUploadNames) {
            await fileStorage.removeIncompleteUpload(
                process.env.S3_BUCKET_NAME,
                name,
            );
        }
        console.log(
            `Removed ${incompleteUploadNames.length} incomplete uploads from bucket ${process.env.S3_BUCKET_NAME}`,
        );
    });

    // Delete assets and tracks tables
    await db.transaction(async (tx) => {
        // have to write raw SQL, careful to sync with table names in schema
        await tx.execute(sql`DELETE FROM asset`);
        await tx.execute(sql`DELETE FROM track`);
    });

    process.exit(0);
};

try {
    await main();
} catch (error) {
    console.error(error);
    process.exit(1);
}
