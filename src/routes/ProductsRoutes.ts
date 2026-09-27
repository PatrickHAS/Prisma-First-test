import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { validate } from "../middlewares/validate";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/ProductSchema";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { validateId } from "../middlewares/validateId";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireRole } from "../middlewares/requireRole";

const productRoutes = Router();

const productController = new ProductController();

productRoutes.get(
  "/products",
  asyncHandler((req, res) => productController.findAll(req, res)),
);

productRoutes.get(
  "/products/:id",
  validateId,
  asyncHandler((req, res) => productController.findById(req, res)),
);

productRoutes.post(
  "/products",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createProductSchema),
  asyncHandler((req, res) => productController.create(req, res)),
);

productRoutes.patch(
  "/products/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateId,
  validate(updateProductSchema),
  asyncHandler((req, res) => productController.update(req, res)),
);

productRoutes.delete(
  "/products/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateId,
  asyncHandler((req, res) => productController.delete(req, res)),
);

export default productRoutes;
