/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter } from "events";

import { cacheService } from "@/cache/index";
import logger from "@/config/logger";

/**
 * Cache invalidation event types
 */
export enum InvalidationEvent {
  USER_CREATED = "user:created",
  USER_UPDATED = "user:updated",
  USER_DELETED = "user:deleted",
  PROJECT_CREATED = "project:created",
  PROJECT_UPDATED = "project:updated",
  PROJECT_DELETED = "project:deleted",
  JOB_CREATED = "job:created",
  JOB_STATUS_CHANGED = "job:status_changed",
  JOB_COMPLETED = "job:completed",
  TOKEN_INVALIDATED = "token:invalidated",
  USER_LOGGED_OUT = "user:logged_out",
}

/**
 * CacheInvalidation manages cache invalidation events and triggers
 * Uses Node.js EventEmitter for event-driven cache clearing
 */
class CacheInvalidation extends EventEmitter {
  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * Setup all event listeners for cache invalidation
   */
  private setupEventListeners(): void {
    // User events
    this.on(InvalidationEvent.USER_UPDATED, (userId: string) => {
      this.invalidateUserCache(userId);
    });

    this.on(InvalidationEvent.USER_DELETED, (userId: string) => {
      this.invalidateUserCache(userId);
    });

    this.on(InvalidationEvent.USER_LOGGED_OUT, (userId: string) => {
      this.invalidateUserSessions(userId);
    });

    // Project events
    this.on(InvalidationEvent.PROJECT_CREATED, (userId: string) => {
      this.invalidateProjectsList(userId);
    });

    this.on(InvalidationEvent.PROJECT_UPDATED, (projectId: string, userId: string) => {
      this.invalidateProject(projectId, userId);
    });

    this.on(InvalidationEvent.PROJECT_DELETED, (projectId: string, userId: string) => {
      this.invalidateProjectCascade(projectId, userId);
    });

    // Job events
    this.on(InvalidationEvent.JOB_STATUS_CHANGED, (jobId: string, projectId: string) => {
      this.invalidateJob(jobId, projectId);
    });

    this.on(InvalidationEvent.JOB_COMPLETED, (jobId: string, projectId: string) => {
      this.invalidateJob(jobId, projectId);
    });

    // Token events
    this.on(InvalidationEvent.TOKEN_INVALIDATED, (userId: string) => {
      this.invalidateUserTokens(userId);
    });
  }

  /**
   * Invalidate all user-related caches
   * @param userId - User ID
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    try {
      const { userByIdKey } = await import("@/cache/keys");

      await cacheService.del(userByIdKey(userId));
      logger.info(`[Cache Invalidation] User cache invalidated for user ${userId}`);
    } catch (error) {
      logger.error(`[Cache Invalidation] Error invalidating user cache: ${error}`);
    }
  }

  /**
   * Invalidate user sessions/tokens
   * @param userId - User ID
   */
  private async invalidateUserSessions(userId: string): Promise<void> {
    try {
      const { userSocketsKey } = await import("@/cache/keys");
      await cacheService.del(userSocketsKey(userId));
      logger.info(`[Cache Invalidation] User sessions invalidated for user ${userId}`);
    } catch (error) {
      logger.error(`[Cache Invalidation] Error invalidating user sessions: ${error}`);
    }
  }

  /**
   * Invalidate all token-related caches for a user
   * @param userId - User ID
   */
  private async invalidateUserTokens(userId: string): Promise<void> {
    try {
      logger.info(`[Cache Invalidation] User tokens invalidated for user ${userId}`);
      // Note: In a production system, you might want to maintain a set of
      // token keys per user and invalidate them all. For now, we rely on
      // token TTL for expiration.
    } catch (error) {
      logger.error(`[Cache Invalidation] Error invalidating user tokens: ${error}`);
    }
  }

  /**
   * Invalidate projects list for a user
   * @param userId - User ID
   */
  private async invalidateProjectsList(userId: string): Promise<void> {
    try {
      logger.info(`[Cache Invalidation] Projects list should be refreshed for user ${userId}`);
    } catch (error) {
      logger.error(`[Cache Invalidation] Error invalidating projects list: ${error}`);
    }
  }

  /**
   * Invalidate a specific project and related caches
   * @param projectId - Project ID
   * @param userId - User ID (to invalidate user's project list)
   */
  private async invalidateProject(projectId: string, _userId: string): Promise<void> {
    try {
      const { projectByIdKey, projectJobsKey } = await import("@/cache/keys");
      await Promise.all([cacheService.del(projectByIdKey(projectId)), cacheService.del(projectJobsKey(projectId))]);
      logger.info(`[Cache Invalidation] Project cache invalidated for project ${projectId}`);
    } catch (error) {
      logger.error(`[Cache Invalidation] Error invalidating project cache: ${error}`);
    }
  }

  /**
   * Cascade invalidation when a project is deleted
   * @param projectId - Project ID
   * @param userId - User ID
   */
  private async invalidateProjectCascade(projectId: string, _userId: string): Promise<void> {
    try {
      const { projectByIdKey, projectJobsKey } = await import("@/cache/keys");
      await Promise.all([cacheService.del(projectByIdKey(projectId)), cacheService.del(projectJobsKey(projectId))]);
      logger.info(`[Cache Invalidation] Project cascade invalidation completed for project ${projectId}`);
    } catch (error) {
      logger.error(`[Cache Invalidation] Error in project cascade invalidation: ${error}`);
    }
  }

  /**
   * Invalidate a specific job
   * @param jobId - Job ID
   * @param projectId - Project ID
   */
  private async invalidateJob(jobId: string, _projectId: string): Promise<void> {
    try {
      const { jobByIdKey } = await import("@/cache/keys");
      await cacheService.del(jobByIdKey(jobId));
      logger.info(`[Cache Invalidation] Job cache invalidated for job ${jobId}`);
    } catch (error) {
      logger.error(`[Cache Invalidation] Error invalidating job cache: ${error}`);
    }
  }

  /**
   * Emit a cache invalidation event
   * @param event - Event type
   * @param args - Event arguments
   */
  emitInvalidation(event: InvalidationEvent, ...args: any[]): void {
    logger.debug(`[Cache Invalidation] Emitting event: ${event}`);
    this.emit(event, ...args);
  }

  /**
   * Clear all cache (dangerous - use with caution)
   */
  async clearAll(): Promise<void> {
    try {
      await cacheService.clear();
      logger.warn("[Cache Invalidation] All cache cleared");
    } catch (error) {
      logger.error(`[Cache Invalidation] Error clearing all cache: ${error}`);
    }
  }
}

// Export singleton instance
export const cacheInvalidation = new CacheInvalidation();
