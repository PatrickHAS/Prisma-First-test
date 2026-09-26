import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { createOrderSchema } from "../schemas/OrderSchema";

const orderRoutes = Router();

const orderController = new OrderController();

orderRoutes.post(
  "/orders",
  authMiddleware,
  validate(createOrderSchema),
  (req, res) => orderController.create(req, res),
);

orderRoutes.get("/orders", authMiddleware, (req, res) =>
  orderController.findAll(req, res),
);

orderRoutes.get("/orders/:id", authMiddleware, (req, res) =>
  orderController.findById(req, res),
);

export default orderRoutes;
