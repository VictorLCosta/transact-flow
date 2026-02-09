import { createHash } from "crypto";

import config from "config";
import jwt from "jsonwebtoken";
import moment from "moment";

import { cacheService } from "@/cache/index";
import { tokenKey } from "@/cache/keys";
import { prisma } from "@/client";
import logger from "@/config/logger";

import type { Moment } from "moment";
import type { AuthTokensResponse } from "types/response";

const generateToken = (userId: string, expires: Moment, secret = config.JWT_SECRET): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, secret!);
};

/**
 * Hash a token for use as a cache key
 * Uses SHA256 to create a consistent, short hash
 */
const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

const verifyToken = async (token: string) => {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET! as string) as any;
    if (!payload || !payload.sub) return null;

    const tokenHash = hashToken(token);
    const cacheKey = tokenKey(tokenHash);

    // Try to get from cache first
    const cachedUser = await cacheService.get(cacheKey);
    if (cachedUser) {
      logger.debug(`[Token Service] Verified token from cache for user ${payload.sub}`);
      return cachedUser;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (user) {
      // Cache the verified token with configured TTL
      await cacheService.set(cacheKey, user, config.CACHING.TOKEN_TTL);
      logger.debug(`[Token Service] Cached verified token for user ${payload.sub}`);
    }

    return user || null;
  } catch {
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
