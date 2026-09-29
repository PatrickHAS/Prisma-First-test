import { OrderController } from "../../controllers/OrderController";

const mockCreateOrder = jest.fn();
const mockFindOrdersByUser = jest.fn();
const mockFindOrderById = jest.fn();

jest.mock("../../services/OrderService", () => ({
  OrderService: jest.fn().mockImplementation(() => ({
    createOrder: mockCreateOrder,
    findOrdersByUser: mockFindOrdersByUser,
    findOrderById: mockFindOrderById,
  })),
}));

describe("OrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um pedido com sucesso", async () => {
    const items = [
      {
        productId: 1,
        quantity: 2,
      },
    ];

    const createdOrder = {
      id: 100,
      userId: 1,
      total: 300000,
      status: "PENDING",
    };

    mockCreateOrder.mockResolvedValue(createdOrder);

    const req = {
      userId: 1,
      body: {
        items,
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const controller = new OrderController();

    await controller.create(req, res);

    expect(mockCreateOrder).toHaveBeenCalledWith(1, items);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(createdOrder);
  });
});

it("deve retornar os pedidos do usuário", async () => {
  const orders = [
    {
      id: 1,
      userId: 1,
      total: 300000,
      status: "PENDING",
    },
    {
      id: 2,
      userId: 1,
      total: 150000,
      status: "CONFIRMED",
    },
  ];

  mockFindOrdersByUser.mockResolvedValue(orders);

  const req = {
    userId: 1,
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new OrderController();

  await controller.findAll(req, res);

  expect(mockFindOrdersByUser).toHaveBeenCalledWith(1);

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith({
    data: orders,
  });
});

it("deve retornar um pedido pelo id", async () => {
  const order = {
    id: 10,
    userId: 1,
    total: 300000,
    status: "PENDING",
  };

  mockFindOrderById.mockResolvedValue(order);

  const req = {
    userId: 1,
    params: {
      id: "10",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new OrderController();

  await controller.findById(req, res);

  expect(mockFindOrderById).toHaveBeenCalledWith(10, 1);

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith(order);
});
