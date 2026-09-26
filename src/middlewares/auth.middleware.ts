import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/TokenService";

const tokenService = new TokenService();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Token não informado",
    });
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }

  try {
    const payload = await tokenService.verifyToken(token);

    if (typeof payload.userId !== "number") {
      return res.status(401).json({
        message: "Token inválido",
      });
    }

    req.userId = payload.userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}
