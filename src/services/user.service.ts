import prisma from "client";
import httpStatus from "http-status";
import ApiError from "utils/ApiError";
import { encryptPassword } from "utils/encryption";

import type { User } from "@prisma/client";

const createUser = async (email: string, password: string): Promise<User> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  return prisma.user.create({
    data: {
      email,
      password: await encryptPassword(password),
    },
  });
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const getUserById = async <Key extends keyof User>(
  id: string,
  keys: Key[] = ["id", "email", "name", "password", "role", "isEmailVerified", "createdAt", "updatedAt"] as Key[],
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

export default {
  createUser,
  getUserByEmail,
  getUserById,
};
