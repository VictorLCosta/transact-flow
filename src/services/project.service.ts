import { prisma } from "client";
import httpStatus from "http-status";
import ApiError from "utils/ApiError";

import type { Project, Prisma } from "generated/prisma/client";

const getProjects = async <Key extends keyof Project>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  },
  keys: Key[] = ["id", "name", "createdAt", "projectId"] as Key[],
): Promise<Pick<Project, Key>[]> => {
  const where = { ...filter };
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";

  const projects = await prisma.project.findMany({
    where,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: page * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });

  return projects as Pick<Project, Key>[];
};

const getProjectById = async <Key extends keyof Project>(
  projectId: string,
  keys: Key[] = ["id", "name", "createdAt", "projectId"] as Key[],
): Promise<Pick<Project, Key> | null> => {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Project, Key> | null>;
};

const createProject = async (name: string, userId: string): Promise<Project> => {
  if (await prisma.project.findFirst({ where: { name } })) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Project name already taken");
  }

  const project = await prisma.project.create({ data: { name, userId } });
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

  return updatedproject as Pick<Project, Key> | null;
};

const deleteProject = async (projectId: string): Promise<Project> => {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }

  await prisma.project.delete({ where: { id: project.id } });
  return project;
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
