import "server-only";

import { Redis } from "@upstash/redis";

import { getEnv, isRedisConfigured } from "@/lib/server/env";

let redisClient: Redis | null = null;

export function getRedis() {
  if (!isRedisConfigured()) {
    return null;
  }

  if (!redisClient) {
    const env = getEnv();
    redisClient = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redisClient;
}
