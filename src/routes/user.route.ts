import userController from "controllers/user.controller";
import express from "express";
import auth from "middlewares/auth";
import validate from "middlewares/validate";
import userValidation from "validations/user.validation";

const router = express.Router();

router.route("/").post(validate(userValidation.createUser), userController.createUser);

router.route("/:userId").get(auth(), validate(userValidation.getUser), userController.getUser);

export default router;
