import { ProductService } from "../../services/ProductService";

const mockFindAll = jest.fn();
const mockFindBySku = jest.fn();
const mockCreate = jest.fn();
const mockFindById = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("../../repositories/ProductRepository", () => ({
  ProductRepository: jest.fn().mockImplementation(() => ({
    findAll: mockFindAll,
    findBySku: mockFindBySku,
    create: mockCreate,
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

describe("ProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar produtos com paginação", async () => {
    mockFindAll.mockResolvedValue({
      products: [
        {
          id: 1,
          name: "Anel de Ouro",
          price: 159990,
          stock: 10,
          sku: "ANEL-001",
          active: true,
          categoryId: 1,
        },
      ],
      total: 1,
    });

    const service = new ProductService();

    const result = await service.findAll(1, 10);

    expect(result).toEqual({
      data: [
        {
          id: 1,
          name: "Anel de Ouro",
          price: 159990,
          stock: 10,
          sku: "ANEL-001",
          active: true,
          categoryId: 1,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(mockFindAll).toHaveBeenCalledWith(1, 10, undefined);
  });
});

it("deve rejeitar página inválida", async () => {
  const service = new ProductService();

  await expect(service.findAll(0, 10)).rejects.toThrow("Página inválida");
});

it("deve rejeitar limite maior que 100", async () => {
  const service = new ProductService();

  await expect(service.findAll(1, 101)).rejects.toThrow(
    "O limite deve estar entre 1 e 100",
  );
});

it("deve rejeitar produto sem nome", async () => {
  const service = new ProductService();

  await expect(
    service.create({
      name: "",
      price: 10000,
      stock: 10,
      sku: "ANEL-001",
      categoryId: 1,
    }),
  ).rejects.toThrow("Nome do produto é obrigatório");
});

it("deve rejeitar produto com preço inválido", async () => {
  const service = new ProductService();

  await expect(
    service.create({
      name: "Anel de Ouro",
      price: 0,
      stock: 10,
      sku: "ANEL-001",
      categoryId: 1,
    }),
  ).rejects.toThrow("O preço deve ser maior que zero");
});

it("deve rejeitar produto com estoque negativo", async () => {
  const service = new ProductService();

  await expect(
    service.create({
      name: "Anel de Ouro",
      price: 10000,
      stock: -1,
      sku: "ANEL-001",
      categoryId: 1,
    }),
  ).rejects.toThrow("O estoque não pode ser negativo");
});

it("deve rejeitar produto sem SKU", async () => {
  const service = new ProductService();

  await expect(
    service.create({
      name: "Anel de Ouro",
      price: 10000,
      stock: 10,
      sku: "",
      categoryId: 1,
    }),
  ).rejects.toThrow("SKU é obrigatório");
});

it("deve rejeitar produto com SKU já cadastrado", async () => {
  mockFindBySku.mockResolvedValue({
    id: 1,
    name: "Produto existente",
    sku: "ANEL-001",
  });

  const service = new ProductService();

  await expect(
    service.create({
      name: "Novo Anel",
      price: 10000,
      stock: 10,
      sku: "ANEL-001",
      categoryId: 1,
    }),
  ).rejects.toThrow("SKU já cadastrado");

  expect(mockFindBySku).toHaveBeenCalledWith("ANEL-001");
});

it("deve criar um produto com dados válidos", async () => {
  mockFindBySku.mockResolvedValue(null);

  mockCreate.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    description: "Anel de ouro 18k",
    price: 159990,
    stock: 10,
    sku: "ANEL-001",
    active: true,
    categoryId: 1,
  });

  const service = new ProductService();

  const result = await service.create({
    name: "Anel de Ouro",
    description: "Anel de ouro 18k",
    price: 159990,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });

  expect(result).toEqual({
    id: 1,
    name: "Anel de Ouro",
    description: "Anel de ouro 18k",
    price: 159990,
    stock: 10,
    sku: "ANEL-001",
    active: true,
    categoryId: 1,
  });

  expect(mockFindBySku).toHaveBeenCalledWith("ANEL-001");

  expect(mockCreate).toHaveBeenCalledWith({
    name: "Anel de Ouro",
    description: "Anel de ouro 18k",
    price: 159990,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });
});

it("deve rejeitar atualização de produto inexistente", async () => {
  mockFindById.mockResolvedValue(null);

  const service = new ProductService();

  await expect(
    service.update(999, {
      name: "Anel de Ouro",
    }),
  ).rejects.toThrow("Produto não encontrado");

  expect(mockFindById).toHaveBeenCalledWith(999);
});

it("deve rejeitar atualização com preço inválido", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 10000,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });

  const service = new ProductService();

  await expect(
    service.update(1, {
      price: 0,
    }),
  ).rejects.toThrow("O preço deve ser maior que zero");

  expect(mockFindById).toHaveBeenCalledWith(1);
});

it("deve rejeitar atualização com estoque negativo", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 10000,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });

  const service = new ProductService();

  await expect(
    service.update(1, {
      stock: -1,
    }),
  ).rejects.toThrow("O estoque não pode ser negativo");

  expect(mockFindById).toHaveBeenCalledWith(1);
});

it("deve rejeitar atualização com nome vazio", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 10000,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });

  const service = new ProductService();

  await expect(
    service.update(1, {
      name: "   ",
    }),
  ).rejects.toThrow("Nome do produto não pode ser vazio");

  expect(mockFindById).toHaveBeenCalledWith(1);
});

it("deve rejeitar atualização com SKU já cadastrado em outro produto", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 10000,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });

  mockFindBySku.mockResolvedValue({
    id: 2,
    name: "Colar de Ouro",
    price: 20000,
    stock: 5,
    sku: "ANEL-002",
    categoryId: 1,
  });

  const service = new ProductService();

  await expect(
    service.update(1, {
      sku: "ANEL-002",
    }),
  ).rejects.toThrow("SKU já cadastrado");

  expect(mockFindById).toHaveBeenCalledWith(1);
  expect(mockFindBySku).toHaveBeenCalledWith("ANEL-002");
});

it("deve permitir atualização mantendo o próprio SKU", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 10000,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });

  mockFindBySku.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    sku: "ANEL-001",
  });
});

it("deve atualizar um produto com dados válidos", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 10000,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });

  mockFindBySku.mockResolvedValue({
    id: 1,
    sku: "ANEL-001",
  });

  mockUpdate.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro 18k",
    price: 15000,
    stock: 20,
    sku: "ANEL-001",
    categoryId: 1,
  });

  const service = new ProductService();

  const result = await service.update(1, {
    name: "Anel de Ouro 18k",
    price: 15000,
    stock: 20,
    sku: "ANEL-001",
  });

  expect(result).toEqual({
    id: 1,
    name: "Anel de Ouro 18k",
    price: 15000,
    stock: 20,
    sku: "ANEL-001",
    categoryId: 1,
  });

  expect(mockFindById).toHaveBeenCalledWith(1);
  expect(mockFindBySku).toHaveBeenCalledWith("ANEL-001");

  expect(mockUpdate).toHaveBeenCalledWith(1, {
    name: "Anel de Ouro 18k",
    price: 15000,
    stock: 20,
    sku: "ANEL-001",
  });
});

it("deve rejeitar exclusão de produto inexistente", async () => {
  mockFindById.mockResolvedValue(null);

  const service = new ProductService();

  await expect(service.delete(999)).rejects.toThrow("Produto não encontrado");

  expect(mockFindById).toHaveBeenCalledWith(999);
});

it("deve excluir um produto existente", async () => {
  mockFindById.mockResolvedValue({
    id: 1,
    name: "Anel de Ouro",
    price: 10000,
    stock: 10,
    sku: "ANEL-001",
    categoryId: 1,
  });

  mockDelete.mockResolvedValue({
    id: 1,
  });

  const service = new ProductService();

  const result = await service.delete(1);

  expect(result).toEqual({
    id: 1,
  });

  expect(mockFindById).toHaveBeenCalledWith(1);
  expect(mockDelete).toHaveBeenCalledWith(1);
});
