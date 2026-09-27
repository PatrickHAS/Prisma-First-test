import { validateId } from "../../middlewares/validateId";

describe("validateId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve permitir quando o ID for válido", () => {
    const req = {
      params: {
        id: "10",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    validateId(req, res, next);

    expect(req.params.id).toBe("10");
    expect(next).toHaveBeenCalled();

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("deve rejeitar quando o ID for inválido", () => {
    const req = {
      params: {
        id: "abc",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    validateId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "ID inválido",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("deve rejeitar quando o ID for menor ou igual a zero", () => {
    const req = {
      params: {
        id: "0",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    validateId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "ID inválido",
    });

    expect(next).not.toHaveBeenCalled();
  });
});
