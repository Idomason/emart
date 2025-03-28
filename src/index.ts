import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

// Validate critical environment variables are present
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET environment variable is not defined!");
  console.error("Authentication features may not work correctly.");
}

import app from "./app";
import { connectToDB } from "./config/db";
import { NextFunction, Request, Response } from "express";
import { initializeSocket } from "./services/socketService";

const port = process.env.PORT || 8000;

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const server = app.listen(port, () => {
  connectToDB();
  console.log(`App running on port:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `JWT_SECRET is ${process.env.JWT_SECRET ? "configured" : "NOT CONFIGURED"}`
  );
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});

// WebSocket initialization
initializeSocket(server);
