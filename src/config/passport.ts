import { prisma } from "client";
import config from "config";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import type { VerifyCallback } from "passport-jwt";

const jwtOptions = {
  secretOrKey: config.JWT_SECRET!,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify: VerifyCallback = async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
      },
      where: { id: payload.sub },
    });
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
