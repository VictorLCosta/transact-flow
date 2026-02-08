import config from "@/config";
import logger from "@/config/logger";

import app from "./app";
import { initSocket } from "./socket";

import type { Server } from "http";

const server: Server = app.listen(config.PORT, () => {
  logger.info("Server is running on port " + config.PORT);
});

const io = await initSocket(server);

const exitHandler = () => {
  if (io) {
    io.close(() => {
      if (server) {
        server.close(() => {
          logger.info("Server closed");
          process.exit(1);
        });
      }
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    io.close(() => {
      server.close(() => {
        process.exit(0);
      });
    });
  }
});
