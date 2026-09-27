import { Request, Response, NextFunction } from "express";

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    next();
  };
}
