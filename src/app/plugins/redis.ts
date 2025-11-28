import fastifyPlugin from "fastify-plugin";
import Redis from "ioredis";
import config from "../config/config";

export const redisPlugin = fastifyPlugin(async (fastify, opts) => {
  const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    password: undefined,
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    },
  });

  redis.on("connect", () => {
    console.log("\x1b[33m%s\x1b[0m", "Redis TCP connection established!");
  });

  redis.on("ready", () => {
    console.log("\x1b[32m%s\x1b[0m", "Redis ready to accept commands!");
  });

  redis.on("error", (err) => {
    console.error("\x1b[31m%s\x1b[0m", "Redis connection error:", err);
  });

  fastify.decorate("redis", redis);

  fastify.addHook("onClose", async (fastifyInstance) => {
    try {
      await redis.quit();
      fastify.log.info("Redis connection closed");
    } catch (err: any) {
      fastify.log.error("Error closing Redis connection:", err);
    }
  });
});

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}
