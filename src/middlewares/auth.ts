import User from "../models/userModel";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticate =
  (role?: "admin") =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({ message: "No token provided, please login" });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
      const user = await User.findById(decoded.id);

      if (!user || (role && user.role !== role)) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      let message = "Authentication failed";
      if (error instanceof jwt.JsonWebTokenError) {
        message = "Invalid token";
      } else if (error instanceof Error) {
        message = error.message;
      }
      next(new Error(message));
    }
  };
