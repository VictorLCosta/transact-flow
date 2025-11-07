import httpStatus from "http-status";
import { userService } from "services";
import catchAsync from "utils/catch-async";

const createUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.createUser(email, password);
  res.status(httpStatus.CREATED).send(user);
});

const getUser = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const user = await userService.getUserById(userId);

  if (!user) {
    res.status(httpStatus.NOT_FOUND).send({ message: "User not found" });
  }

  res.send(user);
});

export default {
  createUser,
  getUser,
};
