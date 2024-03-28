import { db, fileStorage, redis } from '@/infra';
import { withErrorHandling } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
    const start = performance.now();
    await db.execute(sql`SELECT 1`);
    const databaseLatency = (performance.now() - start).toFixed(2);
    await redis.ping();
    const cacheLatency = (
        performance.now() -
        start -
        Number(databaseLatency)
    ).toFixed(2);
    await fileStorage.bucketExists('bucket-name-of-a-non-existent-bucket');
    const fileStorageLatency = (
        performance.now() -
        start -
        Number(databaseLatency) -
        Number(cacheLatency)
    ).toFixed(2);
    return HttpResponse.success({
        databaseLatency: databaseLatency + 'ms',
        cacheLatency: cacheLatency + 'ms',
        fileStorageLatency: fileStorageLatency + 'ms',
    });
});
