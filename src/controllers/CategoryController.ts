import type { Request, Response } from "express";

import { CategoryService } from "../services/CategoryService";

export class CategoryController {
  private readonly categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async findAll(_req: Request, res: Response) {
    const categories = await this.categoryService.findAll();

    return res.status(200).json(categories);
  }
}
