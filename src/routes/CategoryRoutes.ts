import { Router } from "express";

import { CategoryController } from "../controllers/CategoryController";

const categoryRoutes = Router();

const categoryController = new CategoryController();

categoryRoutes.get("/", (req, res) => categoryController.findAll(req, res));

export default categoryRoutes;
