import httpStatus from "http-status";
import projectService from "services/project.service";
import ApiError from "utils/ApiError";
import catchAsync from "utils/catch-async";
import pick from "utils/pick";

const createProject = catchAsync(async (req, res) => {
  const { name } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const project = await projectService.createProject(name, userId);
  res.status(httpStatus.CREATED).send(project);
});

const getProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);

  const result = await projectService.getProjects(filter, options);
  res.send(result);
});

const getProjectById = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) {
    res.status(httpStatus.NOT_FOUND).send({ message: "Project not found" });
  }

  res.send(project);
});

const updateProject = catchAsync(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.send(project);
});

const deleteProject = catchAsync(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  updateProject,
};
