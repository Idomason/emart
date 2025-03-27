import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/userModel";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the token from the cookie
    const token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Please login to access this resource",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Check if user still exists
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User no longer exists",
      });
      return;
    }

    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};
