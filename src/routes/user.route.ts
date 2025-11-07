import userController from "controllers/user.controller";
import express from "express";
import validate from "middlewares/validate";
import userValidation from "validations/user.validation";

const router = express.Router();

router.route("/").post(validate(userValidation.createUser), userController.createUser);

router.route("/:userId").get(validate(userValidation.getUser), userController.getUser);

export default router;
