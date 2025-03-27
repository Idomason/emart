import { Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const generateTokenAndSetCookie = (
  id: mongoose.Types.ObjectId,
  res: Response
) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || "1296000"), // 15 days in seconds
  });

  res.cookie("jwt", token, {
    maxAge: parseInt(process.env.JWT_EXPIRES_IN || "1296000") * 1000, // convert to milliseconds
    httpOnly: true, // prevent XSS attacks, cross-site scripting attacks
    sameSite: "strict", // CSRF attacks, cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development", // only send the cookie over https in production
  });
};
