import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../schemas/AuthSchema";
import { asyncHandler } from "../middlewares/asyncHandler";

const authRoutes = Router();

const authController = new AuthController();

authRoutes.post(
  "/auth/register",
  validate(registerSchema),
  asyncHandler((req, res) => authController.register(req, res)),
);

authRoutes.post(
  "/auth/login",
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res)),
);

export default authRoutes;
