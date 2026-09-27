import { Request, Response, NextFunction } from "express";

export function validateId(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "ID inválido",
    });
  }

  req.params.id = String(id);

  next();
}
