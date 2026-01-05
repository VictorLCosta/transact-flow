import ApiError from "utils/ApiError";
import { isPasswordMatch } from "utils/encryption";
import exclude from "utils/exclude";

import userService from "./user.service";

import type { User } from "generated/prisma/client";

const loginWithEmailAndPassword = async (email: string, password: string): Promise<Omit<User, "password">> => {
  const user = await userService.getUserByEmail(email);

  if (!user || !(await isPasswordMatch(password, user.password as string))) {
    throw new ApiError(401, "Incorrect email or password");
  }

  return exclude(user, ["password"]);
};

export default {
  loginWithEmailAndPassword,
};
