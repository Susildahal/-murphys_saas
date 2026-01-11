import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import { verifyFirebaseToken, AuthenticatedRequest } from "./middleware/auth";
import profilerouter from "./routes/profile.routes";
import inviterouter from "./routes/invite.route";
import paymentrouter from "./routes/payment.route";
import categoryrouter from "./routes/category.route";
import servicerouter from "./routes/service.route";
import assignClientRouter from "./routes/assignClient.routes";
import rolerouter from "./routes/role.routes";

// Use profile routes


const app = express();

// Allow all origins for now - CORS needs to allow Vercel frontend
app.use(cors({
  origin: [ 'https://murphys-saas.vercel.app', 'http://localhost:3000' ,'https://murphys-saas.vercel.app/admin/profile', 'http://localhost:3000/admin/profile'],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use("/api", profilerouter);
app.use("/api", inviterouter);
app.use("/api", paymentrouter);
app.use("/api", categoryrouter);
app.use("/api", servicerouter);
app.use("/api", assignClientRouter);
app.use("/api", rolerouter);

app.use(express.json());
app.get("/", (_req, res) => {
  res.send("API is running 🚀");
});

// Protected route example
app.get("/api/mee", verifyFirebaseToken, (req: AuthenticatedRequest, res) => {
  res.json({
    message: "Access granted to protected route",
    user: {
      uid: req.user?.uid,
      email: req.user?.email,
      name: req.user?.name
    }
  });
});


export default app;




