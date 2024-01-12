import { queryClient, redisClient } from '@/server/db';
import { logger } from '@/server/logger';

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
        return Response.json({
            status: 200,
            databaseLatency: databaseLatency + 'ms',
            redisLatency: redisLatency + 'ms',
        });
    } catch (e) {
        return new Response(null, {
            status: 500,
        });
    }
};
