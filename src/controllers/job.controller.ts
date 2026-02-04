import httpStatus from "http-status";
import projectService from "services/project.service";
import catchAsync from "utils/catch-async";

import jobService from "@/services/job.service";
import ApiError from "@/utils/ApiError";

const importJobs = catchAsync(async (req, res) => {
  const { projectId } = req.body;
  const uploadedFile = req.uploadedFile;

  if (!uploadedFile) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing uploaded file");
  }

  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }

  const job = await jobService.createImportJob(projectId, uploadedFile.fileName, uploadedFile.path);
  jobService.enqueueImportJob(job.id, projectId);

  res.status(httpStatus.ACCEPTED).send({
    jobId: job.id,
    status: job.status,
  });
});

const getJob = catchAsync(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, "Import job not found");
  }
  res.send(job);
});

export default {
  importJobs,
  getJob,
};
