import { Router } from "express";
import { 
  registerUser, 
  checkUserExists, 
  getCurrentUser,
  verifyEmail,
  resendVerificationEmail
} from "../conttrolers/auth.controllers";
import { 
  sendVerificationEmail, 
  verifyToken 
} from "../conttrolers/emailVerification.controllers";
import { verifyFirebaseToken } from "../middleware/auth";

const authRouter = Router();

// Public routes
authRouter.get("/auth/check-user", checkUserExists);
authRouter.post("/auth/verify-email", verifyEmail);
authRouter.post("/auth/send-verification", sendVerificationEmail); // Step 1: Send email
authRouter.get("/auth/verify-token", verifyToken); // Step 2: Verify token

// Protected routes (require Firebase authentication)
authRouter.post("/auth/register", verifyFirebaseToken, registerUser);
authRouter.get("/auth/me", verifyFirebaseToken, getCurrentUser);
authRouter.post("/auth/resend-verification", verifyFirebaseToken, resendVerificationEmail);

export default authRouter;
