import { body, ValidationChain } from "express-validator";

export const validateUserLogin: ValidationChain[] = [
  body("email").trim().notEmpty().withMessage("Email is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const validateAdminLogin: ValidationChain[] = [
  body("email").trim().notEmpty().withMessage("Email is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];
