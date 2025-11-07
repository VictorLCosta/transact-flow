import express from "express";

import userRoutes from "./user.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
