import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

import app from "./index";
import connectDB from "./config/connectdb";

const PORT = Number(process.env.PORT) || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to connect to the database", error);
  process.exit(1);
});
