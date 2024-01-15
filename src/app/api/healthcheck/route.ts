import { fileStorageClient, queryClient, redisClient } from '@/db';

export const dynamic = 'force-dynamic';

export const GET = async () => {
    try {
        const start = performance.now();
        await queryClient`SELECT 1`;
        const databaseLatency = (performance.now() - start).toFixed(2);
        await redisClient.ping();
        const redisLatency = (
            performance.now() -
            start -
            Number(databaseLatency)
        ).toFixed(2);
        await fileStorageClient.bucketExists(
            'bucket-name-of-a-non-existent-bucket',
        );
        const fileStorageLatency = (
            performance.now() -
            start -
            Number(databaseLatency) -
            Number(redisLatency)
        ).toFixed(2);
        return Response.json({
            status: 200,
            databaseLatency: databaseLatency + 'ms',
            redisLatency: redisLatency + 'ms',
            fileStorageLatency: fileStorageLatency + 'ms',
        });
    } catch (e) {
        return new Response(null, {
            status: 500,
        });
    }
};
