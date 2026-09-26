import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { validate } from "../middlewares/validate";
import { createProductSchema } from "../schemas/ProductSchema";
import { authMiddleware } from "../middlewares/auth.middleware";

const productRoutes = Router();

const productController = new ProductController();

productRoutes.get("/products", (req, res) =>
  productController.findAll(req, res),
);

productRoutes.get("/products/:id", (req, res) =>
  productController.findById(req, res),
);

productRoutes.post(
  "/products",
  authMiddleware,
  validate(createProductSchema),
  (req, res) => productController.create(req, res),
);

productRoutes.patch("/products/:id", authMiddleware, (req, res) =>
  productController.update(req, res),
);

productRoutes.delete("/products/:id", authMiddleware, (req, res) =>
  productController.delete(req, res),
);

export default productRoutes;
