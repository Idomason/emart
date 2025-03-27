import express from "express";
import { getUserById, getAllUsers } from "../controllers/userController";
import { getMe, login, logout, signUp } from "../controllers/authController";
import { validateUserRegistration } from "../middlewares/validators/signUpValidation";
import { validateUserLogin } from "../middlewares/validators/loginValidation";
import { protectedRoute } from "../middlewares/protectedRoute";

const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/:id").get(getUserById);

export default router;
