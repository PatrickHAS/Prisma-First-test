import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { AppError } from "../errors/AppError";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response) {
    try {
      const user = await this.authService.register(req.body);

      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

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

  async login(req: Request, res: Response) {
    try {
      const user = await this.authService.login(req.body);

      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      if (error instanceof Error) {
        return res.status(401).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: "Erro interno do servidor",
      });
    }
  }
}
