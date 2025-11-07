/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from "http-status";
import passport from "passport";
import ApiError from "utils/ApiError";

import type { User } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";

const verifyCallback =
  (req: any, resolve: (value?: unknown) => void, reject: (reason?: unknown) => void, requiredRights: string[]) =>
  async (err: unknown, user: User | false, info: unknown) => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"));
    }
    req.user = user;

    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
      passport.authenticate("jwt", { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
        req,
        res,
        next,
      );
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
