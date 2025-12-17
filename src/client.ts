import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "@prisma/client";

import config from "./config";

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal & typeof globalThis;

const adapter = new PrismaMssql(config.DATABASE_URL);
const prisma = global.prisma || new PrismaClient({ adapter });

if (config.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
