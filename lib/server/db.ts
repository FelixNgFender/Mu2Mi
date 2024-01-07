import { PrismaClient } from "@prisma/client";
import { createClient, type RedisClientType } from "redis";

const clientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var queryClient: undefined | ReturnType<typeof clientSingleton>;
  var redisClient: undefined | RedisClientType;
}

export const queryClient = globalThis.queryClient ?? clientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.queryClient = queryClient;

export const redisClient =
  globalThis.redisClient ?? createClient({ url: process.env.REDIS_URL });

if (process.env.NODE_ENV !== "production") globalThis.redisClient = redisClient;

redisClient
  .on("error", (err) => console.error("Redis Client Error", err))
  .on("ready", () => console.info("Redis Client Ready"));

const shutdownGracefully = async () => {
  if (globalThis.queryClient) await globalThis.queryClient.$disconnect();
  await redisClient.quit();
  process.exit(0);
};

const signals: Record<string, number> = {
  SIGINT: 2, // Ctrl+C
  SIGTERM: 15, // default `kill` command
};

Object.keys(signals).forEach((signal) => {
  process.on(signal, async () => {
    console.info(
      `Process received a ${signal} signal). Graceful shutdown `,
      new Date().toISOString()
    );
    await shutdownGracefully();
  });
});
