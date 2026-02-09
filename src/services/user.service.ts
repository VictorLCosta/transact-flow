import { prisma } from "client";
import httpStatus from "http-status";
import ApiError from "utils/ApiError";
import { encryptPassword } from "utils/encryption";
import config from "config";

import type { User } from "generated/prisma/client";

import { cacheService } from "@/cache/index";
import { userByIdKey, userByEmailKey } from "@/cache/keys";
import { cacheInvalidation, InvalidationEvent } from "@/cache/invalidation";
import logger from "@/config/logger";

const createUser = async (email: string, password: string): Promise<User> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: await encryptPassword(password),
    },
  });

  // Emit event for cache invalidation listeners
  cacheInvalidation.emitInvalidation(InvalidationEvent.USER_CREATED, user.id);

  return user;
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  const cacheKey = userByEmailKey(email);

  // Try to get from cache first
  const cachedUser = await cacheService.get<User>(cacheKey);
  if (cachedUser) {
    logger.debug(`[User Service] User retrieved from cache by email: ${email}`);
    return cachedUser;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Cache the result (even if null, for a short time to avoid repeated lookups)
  if (user) {
    await cacheService.set(cacheKey, user, config.CACHING.USER_TTL);
    logger.debug(`[User Service] Cached user by email: ${email}`);
  }

  return user;
};

const getUserById = async <Key extends keyof User>(
  id: string,
  keys: Key[] = ["id", "email", "name", "password", "role", "isEmailVerified", "createdAt", "updatedAt"] as Key[],
): Promise<Pick<User, Key> | null> => {
  const cacheKey = userByIdKey(id);

  // Try to get from cache first
  const cachedUser = await cacheService.get<Pick<User, Key>>(cacheKey);
  if (cachedUser) {
    logger.debug(`[User Service] User retrieved from cache by id: ${id}`);
    return cachedUser;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;

  // Cache the result if found
  if (user) {
    await cacheService.set(cacheKey, user, config.CACHING.USER_TTL);
    logger.debug(`[User Service] Cached user by id: ${id}`);
  }

  return user;
};

const updateUser = async <Key extends keyof User>(
  userId: string,
  updateData: Partial<User>,
): Promise<Pick<User, Key> | null> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // Invalidate cache
  cacheInvalidation.emitInvalidation(InvalidationEvent.USER_UPDATED, userId);
  logger.debug(`[User Service] User cache invalidated: ${userId}`);

  return user as Pick<User, Key>;
};

const deleteUser = async (userId: string): Promise<User> => {
  const user = await prisma.user.delete({
    where: { id: userId },
  });

  // Invalidate cache
  cacheInvalidation.emitInvalidation(InvalidationEvent.USER_DELETED, userId);
  logger.debug(`[User Service] User cache invalidated after deletion: ${userId}`);

  return user;
};

export default {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
};
