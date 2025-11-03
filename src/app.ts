import compression from "compression";
import config from "config";
import morgan from "config/morgan";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import xss from "middlewares/xss";

const app = express();

if (config.NODE_ENV !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(helmet());

app.use(express.json());

app.use(xss());

app.use(compression());

app.use(cors());
app.options("/{*any}", cors());

export default app;
