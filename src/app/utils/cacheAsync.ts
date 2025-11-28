import { FastifyInstance } from "fastify";

export const cacheAsync = async <T>(
  fastify: FastifyInstance,
  key: string,
  fn: () => Promise<T>,
  ttl = 60
): Promise<T> => {
  try {
    const cached = await fastify.redis.get(key);
    if (cached) return JSON.parse(cached) as T;

    const result = await fn();
    await fastify.redis.set(key, JSON.stringify(result), "EX", ttl);

    return result;
  } catch (err: any) {
    fastify.log.error("Redis caching error:", err);
    return fn();
  }
};
