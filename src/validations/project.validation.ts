import Joi from "joi";

const createProject = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const getProjects = {
  query: Joi.object().keys({
    name: Joi.string().optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getProject = {
  params: Joi.object().keys({
    id: Joi.string().guid().required(),
  }),
};

const deleteProject = {
  params: Joi.object().keys({
    id: Joi.string().guid().required(),
  }),
};

const updateProject = {
  params: Joi.object().keys({
    id: Joi.string().guid().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().optional(),
  }),
};

export default {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProject,
};
