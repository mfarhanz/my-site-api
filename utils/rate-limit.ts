import { Redis } from "@upstash/redis";
import { RL_MAX_REQUESTS, RL_WINDOW } from './constants.js'

// initialize Redis client once per server instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(ip: any) {
  if (!ip) return false;

  const key = `ratelimit:contact:${ip}`;

  // INCR will create the key if it doesn't exist
  const current = await redis.incr(key);

  // If first increment → set the TTL
  if (current === 1) {
    await redis.expire(key, RL_WINDOW);
  }

  // If they exceeded RL_MAX_REQUESTS → block
  return current <= RL_MAX_REQUESTS;
}
