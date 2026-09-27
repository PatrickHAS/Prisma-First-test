import { OrderService } from "../../services/OrderService";

const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockCreateItem = jest.fn();
const mockUpdateStock = jest.fn();
const mockFindByUserId = jest.fn();
const mockFindByIdAndUserId = jest.fn();

jest.mock("../../repositories/ProductRepository", () => ({
  ProductRepository: jest.fn().mockImplementation(() => ({
    findById: mockFindById,
    updateStock: mockUpdateStock,
  })),
}));

jest.mock("../../repositories/OrderRepository", () => ({
  OrderRepository: jest.fn().mockImplementation(() => ({
    create: mockCreate,
    createItem: mockCreateItem,
    findByIdAndUserId: mockFindByIdAndUserId,
    findByUserId: mockFindByUserId,
  })),
}));

jest.mock("../../prisma/db", () => ({
  db: {
    transaction: jest.fn().mockImplementation(async (callback) => {
      return callback({});
    }),
  },
}));

describe("OrderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve rejeitar pedido quando o produto não existe", async () => {
    mockFindById.mockResolvedValue(null);

    const service = new OrderService();

    await expect(
      service.createOrder(1, [
        {
          productId: 999,
          quantity: 1,
        },
      ]),
    ).rejects.toThrow("Produto 999 não encontrado");

    expect(mockFindById).toHaveBeenCalledWith(999);
  });
});

it("deve rejeitar pedido sem itens", async () => {
  const service = new OrderService();

  await expect(service.createOrder(1, [])).rejects.toThrow(
    "O pedido deve possuir pelo menos um item",
  );
});

it("deve rejeitar quantidade menor ou igual a zero", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 150000,
    stock: 10,
  });

  const service = new OrderService();

  await expect(
    service.createOrder(1, [
      {
        productId: 1,
        quantity: 0,
      },
    ]),
  ).rejects.toThrow("A quantidade deve ser maior que zero");

  expect(mockFindById).toHaveBeenCalledWith(1);
});

it("deve rejeitar pedido quando o estoque for insuficiente", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 150000,
    stock: 2,
  });

  const service = new OrderService();

  await expect(
    service.createOrder(1, [
      {
        productId: 1,
        quantity: 3,
      },
    ]),
  ).rejects.toThrow("Estoque insuficiente para o produto Anel de Ouro");

  expect(mockFindById).toHaveBeenCalledWith(1);
});

it("deve criar um pedido com sucesso", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 150000,
    stock: 10,
  });

  mockCreate.mockResolvedValue({
    id: 100,
    userId: 1,
    total: 300000,
    status: "PENDING",
  });

  mockCreateItem.mockResolvedValue({
    id: 1,
    orderId: 100,
    productId: 1,
    quantity: 2,
    unitPrice: 150000,
  });

  const service = new OrderService();

  const result = await service.createOrder(1, [
    {
      productId: 1,
      quantity: 2,
    },
  ]);

  expect(result).toEqual({
    id: 100,
    userId: 1,
    total: 300000,
    status: "PENDING",
  });

  expect(mockCreate).toHaveBeenCalledWith(
    {
      userId: 1,
      total: 300000,
      status: "PENDING",
    },
    expect.anything(),
  );

  expect(mockCreateItem).toHaveBeenCalledWith(
    {
      orderId: 100,
      productId: 1,
      quantity: 2,
      unitPrice: 150000,
    },
    expect.anything(),
  );

  expect(mockUpdateStock).toHaveBeenCalledWith(1, 8, expect.anything());
});

it("deve rejeitar produtos duplicados no pedido", async () => {
  const service = new OrderService();

  await expect(
    service.createOrder(1, [
      {
        productId: 1,
        quantity: 1,
      },
      {
        productId: 1,
        quantity: 2,
      },
    ]),
  ).rejects.toThrow(
    "O mesmo produto não pode ser adicionado mais de uma vez ao pedido",
  );

  expect(mockFindById).not.toHaveBeenCalled();
});

it("deve retornar os pedidos do usuário", async () => {
  const orders = [
    {
      id: 100,
      userId: 1,
      total: 300000,
      status: "PENDING",
    },
    {
      id: 101,
      userId: 1,
      total: 500000,
      status: "CONFIRMED",
    },
  ];

  mockFindByUserId.mockResolvedValue(orders);

  const service = new OrderService();

  const result = await service.findOrdersByUser(1);

  expect(result).toEqual(orders);

  expect(mockFindByUserId).toHaveBeenCalledWith(1);
});

it("deve rejeitar quando o pedido não existe", async () => {
  mockFindByIdAndUserId.mockResolvedValue(null);

  const service = new OrderService();

  await expect(service.findOrderById(999, 1)).rejects.toThrow(
    "Pedido não encontrado",
  );

  expect(mockFindByIdAndUserId).toHaveBeenCalledWith(999, 1);
});

it("deve retornar um pedido pelo id", async () => {
  const order = {
    id: 100,
    userId: 1,
    total: 300000,
    status: "PENDING",
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        unitPrice: 150000,
      },
    ],
  };

  mockFindByIdAndUserId.mockResolvedValue(order);

  const service = new OrderService();

  const result = await service.findOrderById(100, 1);

  expect(result).toEqual(order);

  expect(mockFindByIdAndUserId).toHaveBeenCalledWith(100, 1);
});
