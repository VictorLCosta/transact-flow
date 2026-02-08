import config from "config";
import jwt from "jsonwebtoken";
import moment from "moment";

import type { Moment } from "moment";
import type { AuthTokensResponse } from "types/response";

import { prisma } from "@/client";

const generateToken = (userId: string, expires: Moment, secret = config.JWT_SECRET): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, secret!);
};

const verifyToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET! as string) as any;
    if (!payload || !payload.sub) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    return user || null;
  } catch (err) {
    return null;
  }
};

const generateAuthTokens = (user: { id: string }): AuthTokensResponse => {
  const accessTokenExpires = moment().add(config.JWT_ACCESS_EXPIRATION_MINUTES, "minutes");
  const accessToken = generateToken(user.id, accessTokenExpires);

  const refreshTokenExpires = moment().add(config.JWT_REFRESH_EXPIRATION_DAYS, "days");
  const refreshToken = generateToken(user.id, refreshTokenExpires);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

export default {
  generateToken,
  generateAuthTokens,
  verifyToken,
};
