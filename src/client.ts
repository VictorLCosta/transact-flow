import { PrismaMssql } from "@prisma/adapter-mssql";

import config from "./config";
import { PrismaClient } from "./generated/prisma/client";

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal & typeof globalThis;

const adapter = new PrismaMssql(config.DATABASE_URL);
const prisma = global.prisma || new PrismaClient({ adapter });

if (config.NODE_ENV === "development") global.prisma = prisma;

export { prisma };
