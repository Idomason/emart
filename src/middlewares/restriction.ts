import { NextFunction, Request, Response } from "express";

export const restrictedToAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }

  next();
};
