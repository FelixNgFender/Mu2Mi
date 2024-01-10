import { queryClient, redisClient } from '@/src/app/_server/db';

export const GET = async () => {
    try {
        await queryClient`SELECT 1`;
        await redisClient.ping();
        return new Response(null, {
            status: 200,
        });
    } catch (e) {
        console.error(e);
        return new Response(null, {
            status: 500,
        });
    }
};
