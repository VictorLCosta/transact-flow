import fs from "node:fs";
import path from "node:path";

import { prisma } from "@/client";
import type { ImportJob } from "@/generated/prisma/client";
import { enqueueImport } from "@/jobs/import-runner";

const IMPORTS_DIR = path.join(process.cwd(), "tmp", "imports");

const createImportJob = async (projectId: string, fileName: string, tempFilePath: string): Promise<ImportJob> => {
  const job = await prisma.importJob.create({
    data: {
      projectId,
      fileName,
      status: "pending",
      totalLines: 0,
    },
  });

  fs.mkdirSync(IMPORTS_DIR, { recursive: true });
  const destPath = path.join(IMPORTS_DIR, `${job.id}.csv`);
  fs.renameSync(tempFilePath, destPath);

  return job;
};

const getJobById = async (id: string): Promise<ImportJob | null> => {
  return prisma.importJob.findUnique({
    where: { id },
  });
};

const enqueueImportJob = (jobId: string, projectId: string): void => {
  enqueueImport(jobId, projectId);
};

export default {
  createImportJob,
  getJobById,
  enqueueImportJob,
};
