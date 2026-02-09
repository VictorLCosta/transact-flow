import Redis from "ioredis";

import config from "@/config";
import logger from "@/config/logger";

import type { RedisOptions } from "ioredis";

interface CustomNodeJsGlobal {
  redis: Redis | RedisNoOp;
}

declare const global: CustomNodeJsGlobal & typeof globalThis;

/**
 * No-op Redis client for graceful degradation when Redis is disabled or unavailable.
 * Implements the same interface as Redis client but does nothing.
 */
class RedisNoOp {
  private readonly reason: string;

  constructor(reason: string) {
    this.reason = reason;
  }

  /**
   * Log that this is a no-op operation
   */
  private logNoOp(method: string): void {
    logger.debug(`[Redis NoOp] ${method}: ${this.reason}`);
  }

  async get(key: string): Promise<null> {
    this.logNoOp(`get(${key})`);
    return null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<"OK" | null> {
    this.logNoOp(`set(${key})`);
    return null;
  }

  async setex(key: string, seconds: number, value: string): Promise<"OK" | null> {
    this.logNoOp(`setex(${key}, ${seconds})`);
    return null;
  }

  async del(...keys: string[]): Promise<number> {
    this.logNoOp(`del(${keys.join(", ")})`);
    return 0;
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    this.logNoOp(`mget(${keys.join(", ")})`);
    return keys.map(() => null);
  }

  async mset(...args: string[]): Promise<"OK" | null> {
    this.logNoOp(`mset(...)`);
    return null;
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    this.logNoOp(`sadd(${key})`);
    return 0;
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    this.logNoOp(`srem(${key})`);
    return 0;
  }

  async smembers(key: string): Promise<string[]> {
    this.logNoOp(`smembers(${key})`);
    return [];
  }

  async exists(...keys: string[]): Promise<number> {
    this.logNoOp(`exists(${keys.join(", ")})`);
    return 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    this.logNoOp(`expire(${key}, ${seconds})`);
    return 0;
  }

  async ttl(key: string): Promise<number> {
    this.logNoOp(`ttl(${key})`);
    return -2; // key does not exist
  }

  async flushdb(): Promise<"OK" | null> {
    this.logNoOp("flushdb()");
    return null;
  }

  async flushall(): Promise<"OK" | null> {
    this.logNoOp("flushall()");
    return null;
  }

  async ping(): Promise<string> {
    this.logNoOp("ping()");
    return "PONG (no-op)";
  }

  isConnected(): boolean {
    return false;
  }

  getStatus(): string {
    return `disconnected - ${this.reason}`;
  }

  get status(): string {
    return this.getStatus();
  }
}

/**
 * Create and configure the Redis client singleton with error handling and graceful degradation.
 */
function createRedisClient(): Redis | RedisNoOp {
  // If caching is disabled in config, return no-op client
  if (!config.CACHING.ENABLED) {
    logger.info("[Cache] Caching disabled via CACHE_ENABLED=false. Using no-op Redis client.");
    return new RedisNoOp("Caching disabled in configuration");
  }

  try {
    const redisOptions: RedisOptions = {
      port: 6379,
      host: config.CACHING.HOST,
      db: 0,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    };

    const redis = new Redis(redisOptions);

    // Handle connection events
    redis.on("connect", () => {
      logger.info("[Redis] Connected to Redis server");
    });

    redis.on("ready", () => {
      logger.info("[Redis] Redis client ready");
    });

    redis.on("error", (error: Error) => {
      logger.warn(`[Redis] Error: ${error.message}`);
      // Note: We don't throw here; the client will attempt to reconnect automatically
      // Operations will wait or fail gracefully based on the error type
    });

    redis.on("reconnecting", () => {
      logger.warn("[Redis] Attempting to reconnect...");
    });

    redis.on("close", () => {
      logger.warn("[Redis] Connection closed");
    });

    // Test the connection with a ping
    redis.ping((error, result) => {
      if (error) {
        logger.warn(`[Redis] Initial connection test failed: ${error.message}`);
        logger.info("[Redis] Proceeding with automatic reconnection strategy");
      } else {
        logger.info(`[Redis] Connection test successful: ${result}`);
      }
    });

    return redis;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[Redis] Failed to create Redis client: ${errorMessage}`);
    logger.info("[Redis] Falling back to no-op Redis client for graceful degradation");
    return new RedisNoOp(`Failed to initialize: ${errorMessage}`);
  }
}

/**
 * Get or create the Redis client singleton
 */
const redis = global.redis || createRedisClient();

// Store in global scope for development to prevent multiple instances
if (config.NODE_ENV === "development") {
  global.redis = redis;
}

/**
 * Check if the Redis client is available and connected
 */
export const isRedisAvailable = (): boolean => {
  if (redis instanceof RedisNoOp) {
    return false;
  }
  return redis.status === "ready" || redis.status === "connecting";
};

/**
 * Get the current Redis connection status
 */
export const getRedisStatus = (): string => {
  if (redis instanceof RedisNoOp) {
    return redis.getStatus();
  }
  return redis.status;
};

/**
 * Gracefully close the Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redis instanceof RedisNoOp) {
    logger.debug("[Redis] No-op client, no connection to close");
    return;
  }

  try {
    await redis.quit();
    logger.info("[Redis] Connection closed gracefully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`[Redis] Error closing connection: ${errorMessage}`);
  }
};

export { redis, RedisNoOp };
export type { Redis };
