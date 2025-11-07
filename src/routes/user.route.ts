import userController from "controllers/user.controller";
import express from "express";

const router = express.Router();

router.route("/").post(userController.createUser);

export default router;
