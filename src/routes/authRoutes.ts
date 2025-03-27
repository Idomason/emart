import express from "express";
import { getMe, login, logout, signUp } from "../controllers/authController";
import { validateUserRegistration } from "../middlewares/validators/signUpValidation";
import { validateUserLogin } from "../middlewares/validators/loginValidation";
import { protectedRoute } from "../middlewares/protectedRoute";

const router = express.Router();

router.post("/signup", validateUserRegistration, signUp);
router.post("/login", validateUserLogin, login);
router.post("/logout", logout);
router.get("/me", protectedRoute, getMe);

export default router;
