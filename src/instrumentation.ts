export const register = async () => {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        if (parseInt(process.versions.node.split('.')[0] ?? '') <= 18) {
            const { webcrypto } = await import('node:crypto');
            globalThis.crypto = webcrypto as Crypto;
        }
        await import('server-only');
        if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
            return;
        }

        const { errorHandler } = await import('@/lib/error');
        const { logger } = await import('@/lib/logger');
        const { redis } = await import('@/infra');

        /**
         * Tear down resources and gracefully exit the process.
         * @param exitCode Non-zero exit code indicates an error.
         */
        const cleanup = async (exitCode: number) => {
            // await queryClient.end();
            // Redis and Minio clients are already closed by the time this function is called.
            await redis.quit();
            logger.info('Gracefully shutting down...');
            process.exit(exitCode);
        };

        const externalSignals = ['SIGINT', 'SIGTERM'];

        externalSignals.forEach((signal) => {
            process.on(signal, async () => {
                await cleanup(0);
            });
        });

        process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
            throw reason;
        });

        process.on('uncaughtException', async (err: Error) => {
            await errorHandler.handleError(err);
        });
    }
};
