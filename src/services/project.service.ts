/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "client";
import config from "config";
import httpStatus from "http-status";
import ApiError from "utils/ApiError";

import { cacheService } from "@/cache";
import { cacheInvalidation, InvalidationEvent } from "@/cache/invalidation";
import { projectByIdKey, projectsListKey } from "@/cache/keys";
import logger from "@/config/logger";

import type { Project, Prisma } from "generated/prisma/client";

const getProjects = async <Key extends keyof Project>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  },
  keys: Key[] = ["id", "name", "createdAt"] as Key[],
): Promise<Pick<Project, Key>[]> => {
  const where = Object.keys(filter).length === 0 ? undefined : { ...filter };
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy ?? "name";
  const sortType = options.sortType ?? "desc";

  // Generate cache key based on filter and pagination
  const userId = (filter as any)?.userId;
  const cacheKey = userId
    ? projectsListKey(userId, (Number(page) - 1) * Number(limit), Number(limit), sortBy, sortType)
    : null;

  // Try to get from cache first
  if (cacheKey) {
    const cachedProjects = await cacheService.get<Pick<Project, Key>[]>(cacheKey);
    if (cachedProjects) {
      logger.debug(`[Project Service] Projects list retrieved from cache for user ${userId}`);
      return cachedProjects;
    }
  }

  const projects = await prisma.project.findMany({
    where,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });

  // Cache the result if it's for a specific user
  if (cacheKey) {
    await cacheService.set(cacheKey, projects, config.CACHING.PROJECT_TTL);
    logger.debug(`[Project Service] Cached projects list for user ${userId}`);
  }

  return projects as Pick<Project, Key>[];
};

const getProjectById = async <Key extends keyof Project>(
  projectId: string,
  keys: Key[] = ["id", "name", "createdAt"] as Key[],
): Promise<Pick<Project, Key> | null> => {
  const cacheKey = projectByIdKey(projectId);

  // Try to get from cache first
  const cachedProject = await cacheService.get<Pick<Project, Key>>(cacheKey);
  if (cachedProject) {
    logger.debug(`[Project Service] Project retrieved from cache: ${projectId}`);
    return cachedProject;
  }

  const project = (await prisma.project.findUnique({
    where: { id: projectId },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  })) as Promise<Pick<Project, Key> | null>;

  // Cache the result if found
  if (project) {
    await cacheService.set(cacheKey, project, config.CACHING.PROJECT_TTL);
    logger.debug(`[Project Service] Cached project: ${projectId}`);
  }

  return project;
};

const createProject = async (name: string, userId: string): Promise<Project> => {
  if (await prisma.project.findFirst({ where: { name } })) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Project name already taken");
  }

  const project = await prisma.project.create({ data: { name, userId } });

  // Invalidate user's projects list cache
  cacheInvalidation.emitInvalidation(InvalidationEvent.PROJECT_CREATED, userId);
  logger.debug(`[Project Service] Projects list cache invalidated after creation for user ${userId}`);

  return project;
};

const updateProject = async <Key extends keyof Project>(
  projectId: string,
  updateBody: Prisma.ProjectUpdateInput,
  keys: Key[] = ["id", "name", "createdAt", "projectId"] as Key[],
): Promise<Pick<Project, Key> | null> => {
  const project = await getProjectById(projectId, ["id", "name", "userId"]);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "project not found");
  }

  const updatedproject = await prisma.project.update({
    where: { id: project.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  });

  // Invalidate cache
  cacheInvalidation.emitInvalidation(InvalidationEvent.PROJECT_UPDATED, projectId, (project as any).userId);
  logger.debug(`[Project Service] Project cache invalidated: ${projectId}`);

  return updatedproject as Pick<Project, Key> | null;
};

const deleteProject = async (projectId: string): Promise<Project> => {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }

  await prisma.project.delete({ where: { id: project.id } });

  // Invalidate cache
  cacheInvalidation.emitInvalidation(InvalidationEvent.PROJECT_DELETED, projectId, (project as any).userId);
  logger.debug(`[Project Service] Project cache invalidated after deletion: ${projectId}`);

  return project;
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
