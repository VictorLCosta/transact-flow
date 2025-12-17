import dotenv from "dotenv";

dotenv.config();

type Config = {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  JWT_ACCESS_EXPIRATION_MINUTES: number;
  JWT_REFRESH_EXPIRATION_DAYS: number;
};

const config: Config = {
  PORT: Number(process.env.APP_PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRATION_MINUTES: Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES) | 30,
  JWT_REFRESH_EXPIRATION_DAYS: Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) | 30,
};

export default config;
