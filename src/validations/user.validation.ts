import Joi from "joi";

import { password } from "./custom.validation";

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().custom(password),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).required(),
  }),
};

export default {
  createUser,
  getUser,
};
