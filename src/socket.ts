/* eslint-disable @typescript-eslint/no-explicit-any */

import { Server } from "socket.io";

import tokenService from "@/services/token.service";

import logger from "./config/logger";

import type { Server as HttpServer } from "http";

let io: Server | null = null;

export async function initSocket(server: HttpServer) {
  io = new Server(server, {
    transports: ["websocket", "polling"],
    pingInterval: 25000,
    pingTimeout: 60000,
    maxHttpBufferSize: 1e6,
    cors: {
      origin: "*",
    },
  });

  // authenticate socket connections via JWT in handshake.auth.token or Authorization header
  io.use(async (socket, next) => {
    try {
      const authToken =
        (socket.handshake.auth && (socket.handshake.auth as any).token) ||
        (socket.handshake.headers && (socket.handshake.headers.authorization as string)?.split(" ")[1]);

      if (!authToken) return next(new Error("Authentication error"));

      const user = await tokenService.verifyToken(authToken);
      if (!user) return next(new Error("Authentication error"));

      // attach user to socket for later use
      (socket as any).user = user;
      return next();
    } catch {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    const userId = user?.id as string | undefined;

    logger.info(`Socket connected ${socket.id} user ${userId ?? "unknown"}`);

    if (userId) socket.join(`user:${userId}`);

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected ${socket.id} ${reason}`);
    });
  });

  return io;
}

export function getIo(): Server | null {
  return io;
}
