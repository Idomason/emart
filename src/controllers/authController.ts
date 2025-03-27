import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/userModel";
import { generateTokenAndSetCookie } from "../utils/generateToken";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, role } = req.body;
    const user = await User.create({ email, password, role });

    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error, please try again",
      });
    }
  }
};

// Login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    generateTokenAndSetCookie(user._id, res);

    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
      message: "User logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.clearCookie("jwt");
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

// Get Me
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
