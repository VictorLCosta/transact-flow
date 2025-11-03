import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import xss from "middlewares/xss";

const app = express();

app.use(helmet());

app.use(express.json());

app.use(xss());

app.use(compression());

app.use(cors());
app.options("/{*any}", cors());

export default app;
