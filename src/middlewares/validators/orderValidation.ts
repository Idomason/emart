import { body } from "express-validator";
import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

export const validateOrder = [
  body("description").notEmpty().withMessage("Description is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
