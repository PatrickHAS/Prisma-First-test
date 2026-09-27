import { authMiddleware } from "../../middlewares/AuthMiddleware";

const mockVerifyToken = jest.fn();

jest.mock("../../services/TokenService", () => ({
  TokenService: jest.fn().mockImplementation(() => ({
    verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
  })),
}));

describe("authMiddleware", () => {
  let authMiddleware: typeof import("../../middlewares/AuthMiddleware").authMiddleware;

  beforeEach(async () => {
    jest.resetModules();

    jest.doMock("../../services/TokenService", () => ({
      TokenService: jest.fn().mockImplementation(() => ({
        verifyToken: mockVerifyToken,
      })),
    }));

    const module = await import("../../middlewares/AuthMiddleware");

    authMiddleware = module.authMiddleware;

    jest.clearAllMocks();

    mockVerifyToken.mockRejectedValue(new Error("Token inválido"));
  });

  it("deve rejeitar quando o token não for informado", async () => {
    const req = {
      headers: {},
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Token não informado",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("deve rejeitar quando o Authorization for inválido", async () => {
    const req = {
      headers: {
        authorization: "Basic abc123",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Token inválido",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("deve rejeitar quando o token for inválido ou expirado", async () => {
    const req = {
      headers: {
        authorization: "Bearer token-invalido",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Token inválido ou expirado",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("deve aceitar um token válido e preencher os dados do usuário", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "USER",
    });

    const req = {
      headers: {
        authorization: "Bearer token-valido",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(mockVerifyToken).toHaveBeenCalledWith("token-valido");

    expect(req.userId).toBe(1);

    expect(req.userRole).toBe("USER");

    expect(next).toHaveBeenCalled();

    expect(res.status).not.toHaveBeenCalled();

    expect(res.json).not.toHaveBeenCalled();
  });
});
