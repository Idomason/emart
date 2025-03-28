import { Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const generateTokenAndSetCookie = (
  id: mongoose.Types.ObjectId,
  res: Response
) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  // Set the JWT in an HTTP-only cookie for security
  res.cookie("jwt", token, {
    httpOnly: true, // prevent XSS attacks, cross-site scripting attacks
    sameSite: "strict", // CSRF attacks, cross-site request forgery attacks
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    secure: process.env.NODE_ENV === "production", // Use Secure cookies in production (requires HTTPS)
  });

  // Also set a non-httpOnly cookie that can be read by JavaScript for socket.io authentication
  res.cookie("socket_token", token, {
    httpOnly: false, // Accessible to JavaScript
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    secure: process.env.NODE_ENV === "production",
  });

  return token;
};
