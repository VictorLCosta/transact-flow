import express from "express";

import projectRoutes from "./project.route";
import userRoutes from "./user.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/projects",
    route: projectRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
