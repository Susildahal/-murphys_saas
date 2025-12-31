import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import { verifyFirebaseToken, AuthenticatedRequest } from "./middleware/auth";



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API is running 🚀");
});

// Protected route example
app.get("/api/protected", verifyFirebaseToken, (req: AuthenticatedRequest, res) => {
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




