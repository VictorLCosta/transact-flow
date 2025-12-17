import { authService, tokenService } from "services";
import catchAsync from "utils/catch-async";

const loginWithEmailAndPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginWithEmailAndPassword(email, password);
  const tokens = tokenService.generateAuthTokens(user);

  res.send({ user, tokens });
});

export default {
  loginWithEmailAndPassword,
};
