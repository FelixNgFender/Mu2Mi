import * as Minio from 'minio';

if (
    !process.env.S3_ENDPOINT ||
    !process.env.S3_PORT ||
    !process.env.S3_USE_SSL ||
    !process.env.S3_ACCESS_KEY ||
    !process.env.S3_SECRET_KEY ||
    !process.env.S3_BUCKET_NAME
) {
    throw new Error('S3 environment variables are not set');
}

const main = async () => {
    const fileStorage = new Minio.Client({
        endPoint: process.env.S3_ENDPOINT,
        port: process.env.S3_PORT * 1,
        useSSL: 'true' === process.env.MINIO_USE_SSL,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
    });

    const exists = await fileStorage.bucketExists(process.env.S3_BUCKET_NAME);
    if (exists) {
        console.info(`Bucket ${process.env.S3_BUCKET_NAME} exists.`);
    } else {
        console.info(`Bucket ${process.env.S3_BUCKET_NAME} does not exist.`);
        console.info(`Creating bucket ${process.env.S3_BUCKET_NAME}...`);
        await fileStorage.makeBucket(process.env.S3_BUCKET_NAME);
        console.info(`Bucket ${process.env.S3_BUCKET_NAME} created.`);
    }
    process.exit(0);
};

try {
    await main();
} catch (error) {
    console.error(error);
    process.exit(1);
}
