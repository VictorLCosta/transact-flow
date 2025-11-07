import { PrismaClient } from "@prisma/client";

import config from "./config";

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal & typeof globalThis;

const prisma = global.prisma || new PrismaClient();

if (config.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
