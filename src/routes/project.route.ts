import projectController from "controllers/project.controller";
import express from "express";
import auth from "middlewares/auth";
import validate from "middlewares/validate";
import projectValidation from "validations/project.validation";

const router = express.Router();

router
  .route("/")
  .get(auth(), validate(projectValidation.getProjects), projectController.getProjects)
  .post(auth(), validate(projectValidation.createProject), projectController.createProject);

router
  .route("/:id")
  .get(auth(), validate(projectValidation.getProject), projectController.getProjectById)
  .put(auth(), validate(projectValidation.updateProject), projectController.updateProject)
  .delete(auth(), validate(projectValidation.deleteProject), projectController.deleteProject);

export default router;
