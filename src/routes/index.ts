import config from "config";
import express from "express";

import authRoutes from "./auth.route";
import docsRoute from "./docs.route";
import jobRoutes from "./job.route";
import projectRoutes from "./project.route";
import userRoutes from "./user.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/projects",
    route: projectRoutes,
  },
  {
    path: "/jobs",
    route: jobRoutes,
  },
];

const devRoutes = [
  {
    path: "/api-docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.NODE_ENV === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
