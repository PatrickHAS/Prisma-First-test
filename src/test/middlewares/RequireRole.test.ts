import { requireRole } from "../../middlewares/requireRole";

describe("requireRole", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve permitir acesso quando o usuário possui a role correta", () => {
    const req = {
      userRole: "ADMIN",
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    const middleware = requireRole("ADMIN");

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("deve negar acesso quando o usuário possui uma role diferente", () => {
    const req = {
      userRole: "USER",
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    const middleware = requireRole("ADMIN");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      message: "Acesso negado",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("deve negar acesso quando a role do usuário não estiver definida", () => {
    const req = {} as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    const middleware = requireRole("ADMIN");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      message: "Acesso negado",
    });

    expect(next).not.toHaveBeenCalled();
  });
});
