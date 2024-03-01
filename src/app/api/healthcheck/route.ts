import { cache, db, fileStorage } from '@/infra';
import { errorHandler } from '@/lib/error';
import { HttpResponse } from '@/lib/response';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export const GET = async () => {
    try {
        const start = performance.now();
        await db.execute(sql`SELECT 1`);
        const databaseLatency = (performance.now() - start).toFixed(2);
        await cache.ping();
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
    } catch (err) {
        await errorHandler.handleError(err as Error);
        return HttpResponse.internalServerError();
    }
};
