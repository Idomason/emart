import dotenv from "dotenv";
import app from "./app";
import { connectToDB } from "./config/db";
import { NextFunction, Request, Response } from "express";
import { initializeSocket } from "./services/socketService";

dotenv.config();

const port = process.env.PORT || 8000;

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const server = app.listen(port, () => {
  connectToDB();
  console.log(`App running on port:${port}`);
});

// WebSocket initialization
initializeSocket(server);
