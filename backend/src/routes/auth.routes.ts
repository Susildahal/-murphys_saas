import { Router } from "express";
import { 
  registerUser, 
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
  login,
  verifyForgotPasswordToken,
  forgotPassword,
  resetPassword

} from "../conttrolers/auth.controllers";
import { 
  sendVerificationEmail, 
  verifyToken 
} from "../conttrolers/emailVerification.controllers";
import { verifyFirebaseToken } from "../middleware/auth";

const authRouter = Router();

// Public routes
authRouter.post("/auth/verify-email", verifyEmail);
authRouter.post("/auth/send-verification", sendVerificationEmail); // Step 1: Send email
authRouter.get("/auth/verify-token", verifyToken); // Step 2: Verify token

// Protected routes (require Firebase authentication)
authRouter.post("/auth/register",  registerUser);
authRouter.get("/auth/me", verifyFirebaseToken, getCurrentUser);
authRouter.post("/auth/resend-verification", verifyFirebaseToken, resendVerificationEmail);
authRouter.post("/auth/refresh-token", refreshToken);
authRouter.post("/auth/login", login);
authRouter.post("/auth/verify-forgot-password-token", verifyForgotPasswordToken);
authRouter.post("/auth/forgot-password", forgotPassword);
authRouter.post("/auth/reset-password", resetPassword);


export default authRouter;
