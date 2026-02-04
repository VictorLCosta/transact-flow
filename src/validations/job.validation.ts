import Joi from "joi";

const getJob = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

export default {
  getJob,
};
