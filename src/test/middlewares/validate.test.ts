import { z } from "zod";
import { validate } from "../../middlewares/validate";

describe("validate", () => {
  const schema = z.object({
    name: z.string().min(1),
    price: z.number().positive(),
  });

  it("deve permitir dados válidos", () => {
    const req = {
      body: {
        name: "Anel de Ouro",
        price: 150000,
      },
    } as any;

    const res = {} as any;

    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();

    expect(req.body).toEqual({
      name: "Anel de Ouro",
      price: 150000,
    });
  });

  it("deve rejeitar dados inválidos", () => {
    const req = {
      body: {
        name: "",
        price: -100,
      },
    } as any;

    const status = jest.fn().mockReturnThis();

    const json = jest.fn();

    const res = {
      status,
      json,
    } as any;

    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(status).toHaveBeenCalledWith(400);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Dados inválidos",
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });
});
