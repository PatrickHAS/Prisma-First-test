import { errorMiddleware } from "../../middlewares/ErrorMiddleware";
import { AppError } from "../../errors/AppError";

describe("errorMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar o status e a mensagem do AppError", () => {
    const error = new AppError("Produto não encontrado", 404);

    const req = {} as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: "Produto não encontrado",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 500 para erros desconhecidos", () => {
    const error = new Error("Erro inesperado");

    const req = {} as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const next = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Erro interno do servidor",
    });

    expect(next).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
