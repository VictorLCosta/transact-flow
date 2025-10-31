import dotenv from "dotenv";

dotenv.config();

type Config = {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL?: string;
};

const config: Config = {
  PORT: Number(process.env.APP_PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
};

export default config;
