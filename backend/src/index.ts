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
const corsOptions = {
  origin: ['https://murphys-saas.vercel.app/',' http://localhost:3000'], // Allow all origins for simplicity; adjust as needed for security
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
 
app.use(cors(corsOptions));
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




