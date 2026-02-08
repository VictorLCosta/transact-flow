import fs from "node:fs";
import path from "node:path";

import { prisma } from "@/client";
import { getIo } from "@/socket";

import processCsvTransactions from "./csv-import";

const IMPORTS_DIR = path.join(process.cwd(), "tmp", "imports");

function runImport(jobId: string, projectId: string): void {
  const filePath = path.join(IMPORTS_DIR, `${jobId}.csv`);
  if (!fs.existsSync(filePath)) {
    prisma.importJob
      .update({
        where: { id: jobId },
        data: { status: "failed" },
      })
      .catch(() => {});
    return;
  }
  processCsvImport(jobId, projectId, filePath).catch(() => {
    prisma.importJob
      .update({
        where: { id: jobId },
        data: { status: "failed" },
      })
      .catch(() => {});
  });
}

async function processCsvImport(jobId: string, projectId: string, filePath: string): Promise<void> {
  await prisma.importJob.update({
    where: { id: jobId },
    data: { status: "processing" },
  });

  const io = getIo();

  // fetch job + project -> userId to emit to the right room
  const job = await prisma.importJob.findUnique({
    where: { id: jobId },
    include: { project: true },
  });
  const userId = job?.project?.userId;

  if (io && userId) {
    io.to(`user:${userId}`).emit("import:started", { jobId });
  }

  await processCsvTransactions(jobId, projectId, filePath, userId);

  await prisma.importJob.update({
    where: { id: jobId },
    data: {
      status: "completed",
      totalLines: 0,
      completedAt: new Date(),
    },
  });

  if (io && job?.project?.userId) {
    io.to(`user:${job.project.userId}`).emit("import:completed", { jobId });
  }
}

export function enqueueImport(jobId: string, projectId: string): void {
  setImmediate(() => runImport(jobId, projectId));
}
