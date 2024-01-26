import { env } from '@/config/env';
import { queryClient, redisClient } from '@/db';
import { errorHandler } from '@/lib/error';
import { logger } from '@/lib/logger';
import express, { NextFunction, Request, Response } from 'express';
import next from 'next';
import 'server-cli-only';

const dev = env.NODE_ENV !== 'production';
const hostname = env.HOST;
const port = env.PORT;

/**
 * Most of the time the default Next.js server will be enough but there are times you'll want to run your own server to integrate into an existing application.
 * Next.js provides [a custom server api](https://nextjs.org/docs/advanced-features/custom-server).
 * Because the Next.js server is a Node.js module you can combine it with any other part of the Node.js ecosystem. In this case we are using express.
 */
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const externalSignals = ['SIGINT', 'SIGTERM'];

/**
 * Tear down resources and gracefully exit the process.
 * @param exitCode Non-zero exit code indicates an error.
 */
export const cleanup = async (exitCode = 0) => {
    await queryClient.end();
    await redisClient.quit();
    logger.info('Gracefully shutting down...');
    process.exit(exitCode);
};

(async () => {
    try {
        await app.prepare();
        const server = express();

        // await (async () => {
        //     redisClient;
        //     await redisClient.connect();
        // })();

        server.all('*', (req: Request, res: Response) => {
            return handle(req, res);
        });

        server.listen(port, hostname, (err?: any) => {
            if (err) throw err;
            logger.info(`> Ready on ${env.ORIGIN} - env ${env.NODE_ENV}`);
        });

        server.use(
            async (
                err: Error,
                req: Request,
                res: Response,
                next: NextFunction,
            ) => {
                await errorHandler.handleError(err);
            },
        );

        process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
            throw reason;
        });

        process.on('uncaughtException', async (err: Error) => {
            await errorHandler.handleError(err);
        });

        externalSignals.forEach((signal) => {
            process.on(signal, async () => {
                await cleanup();
            });
        });
    } catch (err) {
        logger.error(err); // Keep this here instead of using errorHandler to catch errors during startup.
        process.exit(1);
    }
})();
