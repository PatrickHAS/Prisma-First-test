import express from "express";
import request from "supertest";
import { AppError } from "../../errors/AppError";

const mockCreateOrder = jest.fn();
const mockFindOrdersByUser = jest.fn();
const mockFindOrderById = jest.fn();
const mockVerifyToken = jest.fn();

jest.mock("../../services/OrderService", () => ({
  OrderService: jest.fn().mockImplementation(() => ({
    createOrder: (...args: unknown[]) => mockCreateOrder(...args),
    findOrdersByUser: (...args: unknown[]) => mockFindOrdersByUser(...args),
    findOrderById: (...args: unknown[]) => mockFindOrderById(...args),
  })),
}));

jest.mock("../../services/TokenService", () => ({
  TokenService: jest.fn().mockImplementation(() => ({
    verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
    generateToken: jest.fn(),
  })),
}));

import orderRoutes from "../../routes/OrderRoutes";
import { errorMiddleware } from "../../middlewares/ErrorMiddleware";

const app = express();

app.use(express.json());
app.use(orderRoutes);
app.use(errorMiddleware);

describe("OrderRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve bloquear criação de pedido quando o token não for informado", async () => {
    const response = await request(app)
      .post("/orders")
      .send({
        items: [
          {
            productId: 1,
            quantity: 2,
          },
        ],
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Token não informado",
    });

    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("deve criar um pedido para um usuário autenticado", async () => {
    const items = [
      {
        productId: 1,
        quantity: 2,
      },
    ];

    const createdOrder = {
      id: 1,
      userId: 2,
      total: 319980,
      status: "PENDING",
      items: [
        {
          productId: 1,
          quantity: 2,
          unitPrice: 159990,
        },
      ],
    };

    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    mockCreateOrder.mockResolvedValue(createdOrder);

    const response = await request(app)
      .post("/orders")
      .set("Authorization", "Bearer token-valido")
      .send({
        items,
      });

    expect(mockVerifyToken).toHaveBeenCalledWith("token-valido");

    expect(mockCreateOrder).toHaveBeenCalledWith(2, items);

    expect(response.status).toBe(201);

    expect(response.body).toEqual(createdOrder);
  });

  it("deve bloquear criação de pedido com dados inválidos", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    const response = await request(app)
      .post("/orders")
      .set("Authorization", "Bearer token-valido")
      .send({
        items: [],
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Dados inválidos");

    expect(response.body.errors).toBeDefined();

    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("deve bloquear listagem de pedidos quando o token não for informado", async () => {
    const response = await request(app).get("/orders");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Token não informado",
    });

    expect(mockFindOrdersByUser).not.toHaveBeenCalled();
  });

  it("deve listar os pedidos do usuário autenticado", async () => {
    const orders = [
      {
        id: 1,
        userId: 2,
        total: 319980,
        status: "PENDING",
      },
      {
        id: 2,
        userId: 2,
        total: 159990,
        status: "PENDING",
      },
    ];

    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    mockFindOrdersByUser.mockResolvedValue(orders);

    const response = await request(app)
      .get("/orders")
      .set("Authorization", "Bearer token-valido");

    expect(mockVerifyToken).toHaveBeenCalledWith("token-valido");

    expect(mockFindOrdersByUser).toHaveBeenCalledWith(2);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      data: orders,
    });
  });

  it("deve buscar um pedido do usuário autenticado pelo ID", async () => {
    const order = {
      id: 5,
      userId: 2,
      total: 319980,
      status: "PENDING",
      items: [
        {
          productId: 1,
          quantity: 2,
          unitPrice: 159990,
        },
      ],
    };

    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    mockFindOrderById.mockResolvedValue(order);

    const response = await request(app)
      .get("/orders/5")
      .set("Authorization", "Bearer token-valido");

    expect(mockVerifyToken).toHaveBeenCalledWith("token-valido");

    expect(mockFindOrderById).toHaveBeenCalledWith(5, 2);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(order);
  });

  it("deve bloquear busca de pedido com ID inválido", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    const response = await request(app)
      .get("/orders/abc")
      .set("Authorization", "Bearer token-valido");

    expect(mockVerifyToken).toHaveBeenCalledWith("token-valido");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "ID inválido",
    });

    expect(mockFindOrderById).not.toHaveBeenCalled();
  });

  it("deve retornar 404 quando o pedido não existir ou não pertencer ao usuário", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    mockFindOrderById.mockRejectedValue(
      new AppError("Pedido não encontrado", 404),
    );

    const response = await request(app)
      .get("/orders/999")
      .set("Authorization", "Bearer token-valido");

    expect(mockVerifyToken).toHaveBeenCalledWith("token-valido");

    expect(mockFindOrderById).toHaveBeenCalledWith(999, 2);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Pedido não encontrado",
    });
  });

  it("deve retornar 400 quando não houver estoque suficiente", async () => {
    const items = [
      {
        productId: 1,
        quantity: 10,
      },
    ];

    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    mockCreateOrder.mockRejectedValue(
      new AppError("Estoque insuficiente", 400),
    );

    const response = await request(app)
      .post("/orders")
      .set("Authorization", "Bearer token-valido")
      .send({
        items,
      });

    expect(mockVerifyToken).toHaveBeenCalledWith("token-valido");

    expect(mockCreateOrder).toHaveBeenCalledWith(2, items);

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Estoque insuficiente",
    });
  });
});
