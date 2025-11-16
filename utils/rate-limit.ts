import { Redis } from "@upstash/redis";
import { RL_MAX_REQUESTS, RL_WINDOW } from './constants.js'

// initialize Redis client once per server instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(ip: string) {
  if (!ip) return { allowed: false, retryIn: null };

  const key = `ratelimit:contact:${ip}`;

  // INCR will create the key if it doesn't exist
  const current = await redis.incr(key);

  // If first increment → set the TTL
  if (current === 1) {
    await redis.expire(key, RL_WINDOW);
  }

  // If they exceeded RL_MAX_REQUESTS → block
  if (current > RL_MAX_REQUESTS) {
    const ttl = await redis.ttl(key); // seconds left
    return { allowed: false, retryIn: ttl };
  }

  return { allowed: true, retryIn: null };
}
