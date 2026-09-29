import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { validate } from "../middlewares/validate";
import { createOrderSchema } from "../schemas/OrderSchema";
import { validateId } from "../middlewares/validateId";
import { asyncHandler } from "../middlewares/asyncHandler";

const orderRoutes = Router();

const orderController = new OrderController();

orderRoutes.post(
  "/orders",
  authMiddleware,
  validate(createOrderSchema),
  asyncHandler((req, res) => orderController.create(req, res)),
);

orderRoutes.get(
  "/orders",
  authMiddleware,
  asyncHandler((req, res) => orderController.findAll(req, res)),
);

orderRoutes.get(
  "/orders/:id",
  authMiddleware,
  validateId,
  asyncHandler((req, res) => orderController.findById(req, res)),
);

orderRoutes.patch(
  "/orders/:id/cancel",
  authMiddleware,
  validateId,
  asyncHandler((req, res) => orderController.cancel(req, res)),
);

export default orderRoutes;
