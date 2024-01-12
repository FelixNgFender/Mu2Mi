import 'dotenv/config';
import express, { Request, Response } from 'express';
import next from 'next';
import 'server-cli-only';

import { queryClient, redisClient } from './server/db';
import { env } from './server/env';
import { logger } from './server/logger';

const dev = env.NODE_ENV !== 'production';
const hostname = env.HOST || '127.0.0.1';
const port = env.PORT || 3000;

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
const cleanup = async (exitCode = 0) => {
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
            logger.info(
                `> Ready on http://${hostname}:${port} - env ${env.NODE_ENV}`,
            );
        });

        process.on('uncaughtException', async (err) => {
            console.error(err);
            await cleanup(1);
        });

        process.on('unhandledRejection', async (err) => {
            console.error(err);
            await cleanup(1);
        });

        externalSignals.forEach((signal) => {
            process.on(signal, async () => {
                await cleanup();
            });
        });
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
})();
