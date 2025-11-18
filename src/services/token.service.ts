import config from "config";
import jwt from "jsonwebtoken";
import moment from "moment";

import type { Moment } from "moment";

const generateToken = (userId: string, expires: Moment, secret = config.JWT_SECRET): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, secret!);
};

const verifyToken = async (token: string) => {};

export default {
  generateToken,
  verifyToken,
};
