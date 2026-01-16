import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import profilerouter from "./routes/profile.routes";
import inviterouter from "./routes/invite.route";
import paymentrouter from "./routes/payment.route";
import categoryrouter from "./routes/category.route";
import servicerouter from "./routes/service.route";
import assignClientRouter from "./routes/assignClient.routes";
import rolerouter from "./routes/role.routes";
import siteSettingRouter from "./routes/siteSetting.route";
import noticeRouter from "./routes/notic.routes";
import dashboardrouter from "./routes/dashboard";

// Use profile routes


const app = express();

// CORS: use ALLOWED_ORIGINS env var (comma-separated). If not set, allow localhost and the known Vercel preview domain.
const allowedOriginsEnv = 'http://localhost:3001,https://murphys-saas.vercel.app,http://192.168.10.79:3000,http://localhost:3000';
const allowedOrigins = allowedOriginsEnv.split(',')
  .map(s => s.trim())   // remove spaces
  .filter(Boolean); // remove empty strings

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin header - e.g., Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Check if origin is in allowlist or wildcard is enabled
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Origin not allowed - DON'T throw error, just reject without error to prevent serverless loops
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Parse JSON bodies BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (_req, res) => {
  res.send("API is runningeeeeeeee 🚀");
});

// Mount API routes
app.use("/api", profilerouter);
app.use("/api", inviterouter);
app.use("/api", paymentrouter);
app.use("/api", categoryrouter);
app.use("/api", servicerouter);
app.use("/api", assignClientRouter);
app.use("/api", rolerouter);
app.use("/api/settings", siteSettingRouter);
app.use("/api", noticeRouter);
app.use("/api", dashboardrouter);



// Protected route example
// app.get("/api/mee", verifyFirebaseToken, (req: AuthenticatedRequest, res) => {
//   res.json({
//     message: "Access granted to protected route",
//     user: {
//       uid: req.user?.uid,
//       email: req.user?.email,
//       name: req.user?.name
//     }
//   });
// });


export default app;




