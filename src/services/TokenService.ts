import { jwtVerify, SignJWT } from "jose";
import { AppError } from "../errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new AppError("JWT_SECRET não configurado", 500);
}

const secret = new TextEncoder().encode(JWT_SECRET);

export class TokenService {
  async generateToken(userId: number, role: string) {
    return new SignJWT({
      userId,
      role,
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
  }

  async verifyToken(token: string) {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    return payload;
  }
}
