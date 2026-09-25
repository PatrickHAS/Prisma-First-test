import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  async findAll(req: Request, res: Response) {
    const products = await this.productService.findAll();

    return res.status(200).json(products);
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);

    const product = await this.productService.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    return res.status(200).json(product);
  }

  async create(req: Request, res: Response) {
    try {
      const product = await this.productService.create(req.body);

      return res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: "Erro interno do servidor",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID do produto inválido",
        });
      }

      const product = await this.productService.update(id, req.body);

      return res.status(200).json(product);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: "Erro interno do servidor",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          message: "ID do produto inválido",
        });
      }

      await this.productService.delete(id);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Produto não encontrado") {
          return res.status(404).json({
            message: error.message,
          });
        }

        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: "Erro interno do servidor",
      });
    }
  }
}
