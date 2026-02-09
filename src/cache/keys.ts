/**
 * Cache key generator utility
 * Provides consistent, namespaced cache keys for different data types
 */

/**
 * Generate a cache key for token verification
 * @param tokenHash - Hash of the JWT token
 * @returns Cache key string
 */
export const tokenKey = (tokenHash: string): string => `token:${tokenHash}`;

/**
 * Generate a cache key for user by ID
 * @param userId - User ID
 * @returns Cache key string
 */
export const userByIdKey = (userId: string): string => `user:${userId}`;

/**
 * Generate a cache key for user by email
 * @param email - User email address
 * @returns Cache key string
 */
export const userByEmailKey = (email: string): string => `user:email:${email}`;

/**
 * Generate a cache key for projects list for a user
 * @param userId - User ID
 * @param skip - Pagination skip value
 * @param take - Pagination take value
 * @param sortBy - Sort field
 * @param order - Sort order
 * @returns Cache key string
 */
export const projectsListKey = (
  userId: string,
  skip: number = 0,
  take: number = 10,
  sortBy: string = "name",
  order: string = "asc",
): string => `projects:${userId}:${skip}:${take}:${sortBy}:${order}`;

/**
 * Generate a cache key for a specific project
 * @param projectId - Project ID
 * @returns Cache key string
 */
export const projectByIdKey = (projectId: string): string => `project:${projectId}`;

/**
 * Generate a cache key for import job details
 * @param jobId - Import job ID
 * @returns Cache key string
 */
export const jobByIdKey = (jobId: string): string => `job:${jobId}`;

/**
 * Generate a cache key for user socket connections
 * Used to track active sockets per user for Socket.io optimizations
 * @param userId - User ID
 * @returns Cache key string
 */
export const userSocketsKey = (userId: string): string => `sockets:user:${userId}`;

/**
 * Generate a cache key for active import jobs for a project
 * @param projectId - Project ID
 * @returns Cache key string
 */
export const projectJobsKey = (projectId: string): string => `jobs:project:${projectId}`;

/**
 * Get all user-related cache keys for invalidation
 * @param userId - User ID
 * @returns Array of cache key patterns
 */
export const getUserRelatedKeys = (userId: string): string[] => [
  userByIdKey(userId),
  projectsListKey(userId), // Note: this is a prefix pattern, not exact match
];

/**
 * Get all project-related cache keys for invalidation
 * @param projectId - Project ID
 * @returns Array of cache keys
 */
export const getProjectRelatedKeys = (projectId: string): string[] => [
  projectByIdKey(projectId),
  projectJobsKey(projectId),
];

/**
 * Get all job-related cache keys for invalidation
 * @param jobId - Job ID
 * @returns Array of cache keys
 */
export const getJobRelatedKeys = (jobId: string): string[] => [jobByIdKey(jobId)];

/**
 * Get all cache keys for a project (for cascading invalidation)
 * Useful when deleting a project entirely
 * @param projectId - Project ID
 * @returns Array of related cache keys
 */
export const getProjectCascadeKeys = (projectId: string): string[] => [
  projectByIdKey(projectId),
  projectJobsKey(projectId),
  // Note: Individual jobs will need to be cleaned up separately
];
