import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import Busboy from "@fastify/busboy";
import httpStatus from "http-status";

import ApiError from "@/utils/ApiError";

import type { NextFunction, Request, Response } from "express";

const IMPORTS_DIR = path.join(process.cwd(), "tmp", "imports");
const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 1 GiB
const EXPECTED_FILE_FIELD = "file";
const PROJECT_ID_FIELD = "projectId";

export interface UploadedFile {
  path: string;
  fileName: string;
}

function ensureImportsDir(): string {
  fs.mkdirSync(IMPORTS_DIR, { recursive: true });
  return IMPORTS_DIR;
}

const upload = () => (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Content-Type must be multipart/form-data"));
  }

  const fields: Record<string, string> = {};
  let uploadedPath: string | null = null;
  let uploadedFileName: string | null = null;
  let fileReceived = false;
  let error: Error | null = null;

  const busboy = Busboy({
    headers: { "content-type": contentType },
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
      fields: 10,
    },
  });

  busboy.on("field", (fieldname: string, value: string) => {
    if (fieldname === PROJECT_ID_FIELD) {
      fields[fieldname] = value;
    }
  });

  busboy.on("file", (fieldname: string, file: NodeJS.ReadableStream, filename: string) => {
    if (fieldname !== EXPECTED_FILE_FIELD) {
      file.resume();
      return;
    }
    if (fileReceived) {
      file.resume();
      return;
    }
    fileReceived = true;
    const dir = ensureImportsDir();
    const ext = filename ? path.extname(filename) || ".csv" : ".csv";
    const tempName = `upload-${randomUUID()}${ext}`;
    const destPath = path.join(dir, tempName);
    uploadedPath = destPath;
    uploadedFileName = filename || tempName;

    const writeStream = fs.createWriteStream(destPath);
    file.pipe(writeStream);

    writeStream.on("error", (err) => {
      error = err;
      if (uploadedPath && fs.existsSync(uploadedPath)) {
        try {
          fs.unlinkSync(uploadedPath);
        } catch {
          // ignore cleanup errors
        }
        uploadedPath = null;
      }
    });

    writeStream.on("finish", () => {
      writeStream.close();
    });
  });

  busboy.on("finish", () => {
    if (error) {
      return next(error);
    }
    if (!fileReceived || !uploadedPath || !uploadedFileName) {
      return next(new ApiError(httpStatus.BAD_REQUEST, `Missing form field "${EXPECTED_FILE_FIELD}" (CSV file)`));
    }
    if (!fields[PROJECT_ID_FIELD]) {
      if (fs.existsSync(uploadedPath)) {
        try {
          fs.unlinkSync(uploadedPath);
        } catch {
          // ignore
        }
      }
      return next(new ApiError(httpStatus.BAD_REQUEST, `Missing form field "${PROJECT_ID_FIELD}"`));
    }

    req.body = { [PROJECT_ID_FIELD]: fields[PROJECT_ID_FIELD] };
    req.uploadedFile = { path: uploadedPath, fileName: uploadedFileName };
    next();
  });

  busboy.on("error", (err: Error) => {
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      try {
        fs.unlinkSync(uploadedPath);
      } catch {
        // ignore
      }
    }
    next(err);
  });

  req.pipe(busboy);
};

export default upload;
