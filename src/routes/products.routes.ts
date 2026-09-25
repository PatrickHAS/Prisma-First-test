import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { validate } from "../middlewares/validate";
import { createProductSchema } from "../schemas/product.schema";

const productRoutes = Router();

const productController = new ProductController();

productRoutes.get("/products", (req, res) =>
  productController.findAll(req, res),
);

productRoutes.get("/products/:id", (req, res) =>
  productController.findById(req, res),
);

productRoutes.post("/products", validate(createProductSchema), (req, res) =>
  productController.create(req, res),
);

productRoutes.patch("/products/:id", (req, res) =>
  productController.update(req, res),
);

productRoutes.delete("/products/:id", (req, res) =>
  productController.delete(req, res),
);

export default productRoutes;
