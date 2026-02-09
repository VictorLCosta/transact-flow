import dotenv from "dotenv";

dotenv.config();

type CachingConfig = {
  HOST: string;
  ENABLED: boolean;
  TOKEN_TTL: number;
  USER_TTL: number;
  PROJECT_TTL: number;
  JOB_TTL: number;
};

type Config = {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET?: string;
  JWT_ACCESS_EXPIRATION_MINUTES: number;
  JWT_REFRESH_EXPIRATION_DAYS: number;
  CACHING: CachingConfig;
};

const config: Config = {
  PORT: Number(process.env.APP_PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRATION_MINUTES: Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES) | 30,
  JWT_REFRESH_EXPIRATION_DAYS: Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) | 30,
  CACHING: {
    HOST: process.env.REDIS_HOST ?? "redis1",
    ENABLED: process.env.CACHE_ENABLED === "true",
    TOKEN_TTL: Number(process.env.TOKEN_CACHE_TTL) || 900,
    USER_TTL: Number(process.env.USER_CACHE_TTL) || 600,
    PROJECT_TTL: Number(process.env.PROJECT_CACHE_TTL) || 30,
    JOB_TTL: Number(process.env.JOB_CACHE_TTL) || 5,
  },
};

export default config;
