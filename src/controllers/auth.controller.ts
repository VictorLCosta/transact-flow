import { authService } from "services";
import catchAsync from "utils/catch-async";

const loginWithEmailAndPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginWithEmailAndPassword(email, password);

  res.send({ user });
});

export default {
  loginWithEmailAndPassword,
};
