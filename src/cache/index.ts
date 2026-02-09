/* eslint-disable @typescript-eslint/no-explicit-any */

import { redis, isRedisAvailable } from "@/cache/client";
import logger from "@/config/logger";

/**
 * CacheService provides a unified abstraction layer for all caching operations.
 * Handles JSON serialization/deserialization, error handling, and graceful degradation.
 */
export class CacheService {
  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Parsed value or null if not found or error occurs
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, cache miss: ${key}`);
      return null;
    }

    try {
      const value = await redis.get(key);
      if (value === null) {
        logger.debug(`[Cache] Cache miss: ${key}`);
        return null;
      }

      const parsed = JSON.parse(value) as T;
      logger.debug(`[Cache] Cache hit: ${key}`);
      return parsed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error retrieving key ${key}: ${errorMessage}`);
      return null; // Graceful degradation - treat errors as cache miss
    }
  }

  /**
   * Get multiple values from cache in a single operation
   * @param keys - Array of cache keys
   * @returns Object with key-value pairs for found keys
   */
  async mget<T = any>(keys: string[]): Promise<Record<string, T>> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, mget miss for ${keys.length} keys`);
      return {};
    }

    if (keys.length === 0) {
      return {};
    }

    try {
      const values = await redis.mget(...keys);
      const result: Record<string, T> = {};

      for (let i = 0; i < keys.length; i++) {
        if (values[i]) {
          try {
            result[keys[i]] = JSON.parse(values[i]!) as T;
          } catch {
            logger.warn(`[Cache] Failed to parse value for key ${keys[i]}`);
          }
        }
      }

      logger.debug(`[Cache] mget hit ${Object.keys(result).length}/${keys.length} keys`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error in mget: ${errorMessage}`);
      return {}; // Graceful degradation
    }
  }

  /**
   * Set a value in cache with optional TTL
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttl - Time-to-live in seconds (optional)
   * @returns true if successful, false otherwise
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, cache set skipped: ${key}`);
      return false;
    }

    try {
      const serialized = JSON.stringify(value);

      if (ttl) {
        await redis.setex(key, ttl, serialized);
        logger.debug(`[Cache] Set ${key} with TTL ${ttl}s`);
      } else {
        await redis.set(key, serialized);
        logger.debug(`[Cache] Set ${key} (no TTL)`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error setting key ${key}: ${errorMessage}`);
      return false; // Graceful degradation
    }
  }

  /**
   * Set multiple key-value pairs in cache
   * @param pairs - Object with key-value pairs
   * @returns true if successful, false otherwise
   */
  async mset<T = any>(pairs: Record<string, T>): Promise<boolean> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, mset skipped for ${Object.keys(pairs).length} keys`);
      return false;
    }

    const keys = Object.keys(pairs);
    if (keys.length === 0) {
      return true;
    }

    try {
      const args: string[] = [];
      for (const [key, value] of Object.entries(pairs)) {
        args.push(key);
        args.push(JSON.stringify(value));
      }

      await redis.mset(...args);
      logger.debug(`[Cache] mset ${keys.length} keys`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error in mset: ${errorMessage}`);
      return false; // Graceful degradation
    }
  }

  /**
   * Delete a key from cache
   * @param key - Cache key
   * @returns Number of keys deleted (0 or 1)
   */
  async del(key: string): Promise<number> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, delete skipped: ${key}`);
      return 0;
    }

    try {
      const result = await redis.del(key);
      logger.debug(`[Cache] Deleted ${key}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error deleting key ${key}: ${errorMessage}`);
      return 0; // Graceful degradation
    }
  }

  /**
   * Delete multiple keys from cache
   * @param keys - Array of cache keys
   * @returns Number of keys deleted
   */
  async mdel(...keys: string[]): Promise<number> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, delete skipped for ${keys.length} keys`);
      return 0;
    }

    if (keys.length === 0) {
      return 0;
    }

    try {
      const result = await redis.del(...keys);
      logger.debug(`[Cache] Deleted ${result} keys`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error in mdel: ${errorMessage}`);
      return 0; // Graceful degradation
    }
  }

  /**
   * Set a value in a Redis set
   * @param key - Set key
   * @param members - Members to add
   * @returns Number of members added
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, sadd skipped: ${key}`);
      return 0;
    }

    if (members.length === 0) {
      return 0;
    }

    try {
      const result = await redis.sadd(key, ...members);
      logger.debug(`[Cache] Added ${result} members to set ${key}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error in sadd: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Remove members from a Redis set
   * @param key - Set key
   * @param members - Members to remove
   * @returns Number of members removed
   */
  async srem(key: string, ...members: string[]): Promise<number> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, srem skipped: ${key}`);
      return 0;
    }

    if (members.length === 0) {
      return 0;
    }

    try {
      const result = await redis.srem(key, ...members);
      logger.debug(`[Cache] Removed ${result} members from set ${key}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error in srem: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Get all members of a Redis set
   * @param key - Set key
   * @returns Array of members
   */
  async smembers(key: string): Promise<string[]> {
    if (!isRedisAvailable()) {
      logger.debug(`[Cache] Redis unavailable, smembers miss: ${key}`);
      return [];
    }

    try {
      const result = await redis.smembers(key);
      logger.debug(`[Cache] Retrieved ${result.length} members from set ${key}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error in smembers: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Check if a key exists
   * @param key - Cache key
   * @returns true if key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const result = await redis.exists(key);
      return result > 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error checking existence of key ${key}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param key - Cache key
   * @returns TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
   */
  async ttl(key: string): Promise<number> {
    if (!isRedisAvailable()) {
      return -2;
    }

    try {
      return await redis.ttl(key);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error getting TTL for key ${key}: ${errorMessage}`);
      return -2;
    }
  }

  /**
   * Set expiration time for a key
   * @param key - Cache key
   * @param seconds - Seconds until expiration
   * @returns 1 if expiry was set, 0 if key doesn't exist
   */
  async expire(key: string, seconds: number): Promise<number> {
    if (!isRedisAvailable()) {
      return 0;
    }

    try {
      const result = await redis.expire(key, seconds);
      logger.debug(`[Cache] Set expiry for ${key} to ${seconds}s`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`[Cache] Error setting expiry for key ${key}: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Clear all cache (use with caution!)
   * @returns true if successful, false otherwise
   */
  async clear(): Promise<boolean> {
    if (!isRedisAvailable()) {
      logger.debug("[Cache] Redis unavailable, cache clear skipped");
      return false;
    }

    try {
      await redis.flushdb();
      logger.warn("[Cache] Entire cache cleared");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[Cache] Error clearing cache: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get cache statistics / health
   * @returns Basic cache status information
   */
  async getStatus(): Promise<{
    available: boolean;
    status: string;
  }> {
    try {
      const pong = await redis.ping();
      return {
        available: true,
        status: `Redis available - ${pong}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        available: false,
        status: `Redis unavailable - ${errorMessage}`,
      };
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
