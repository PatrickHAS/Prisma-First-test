import { ProductController } from "../../controllers/ProductController";

const mockFindAll = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("../../services/ProductService", () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    findAll: mockFindAll,
    findById: mockFindById,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

describe("ProductController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar um produto pelo id", async () => {
    const product = {
      id: 1,
      name: "Anel de Ouro",
      price: 150000,
      stock: 10,
      sku: "ANEL-001",
    };

    mockFindById.mockResolvedValue(product);

    const req = {
      params: {
        id: "1",
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const controller = new ProductController();

    await controller.findById(req, res);

    expect(mockFindById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(product);
  });
});

it("deve retornar 404 quando o produto não existe", async () => {
  mockFindById.mockResolvedValue(null);

  const req = {
    params: {
      id: "999",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.findById(req, res);

  expect(mockFindById).toHaveBeenCalledWith(999);

  expect(res.status).toHaveBeenCalledWith(404);

  expect(res.json).toHaveBeenCalledWith({
    message: "Produto não encontrado",
  });
});

it("deve listar produtos com paginação padrão", async () => {
  const result = {
    data: [
      {
        id: 1,
        name: "Anel de Ouro",
        price: 150000,
        stock: 10,
        sku: "ANEL-001",
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  };

  mockFindAll.mockResolvedValue(result);

  const req = {
    query: {},
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.findAll(req, res);

  expect(mockFindAll).toHaveBeenCalledWith(1, 10, {});

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith(result);
});

it("deve listar produtos usando paginação e filtros", async () => {
  const result = {
    data: [
      {
        id: 1,
        name: "Anel de Ouro",
        price: 150000,
        stock: 10,
        sku: "ANEL-001",
      },
    ],
    pagination: {
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
    },
  };

  mockFindAll.mockResolvedValue(result);

  const req = {
    query: {
      page: "2",
      limit: "5",
      minPrice: "100000",
      maxPrice: "200000",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.findAll(req, res);

  expect(mockFindAll).toHaveBeenCalledWith(2, 5, {
    minPrice: 100000,
    maxPrice: 200000,
  });

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith(result);
});

it("deve criar um produto com sucesso", async () => {
  const productData = {
    name: "Colar de Ouro",
    description: "Colar de ouro 18k",
    price: 250000,
    stock: 5,
    sku: "COLAR-001",
    categoryId: 1,
  };

  const createdProduct = {
    id: 2,
    ...productData,
    active: true,
  };

  mockCreate.mockResolvedValue(createdProduct);

  const req = {
    body: productData,
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.create(req, res);

  expect(mockCreate).toHaveBeenCalledWith(productData);

  expect(res.status).toHaveBeenCalledWith(201);

  expect(res.json).toHaveBeenCalledWith(createdProduct);
});

it("deve retornar 400 quando ocorrer um erro ao criar o produto", async () => {
  mockCreate.mockRejectedValue(new Error("SKU já cadastrado"));

  const req = {
    body: {
      name: "Colar de Ouro",
      price: 250000,
      stock: 5,
      sku: "COLAR-001",
      categoryId: 1,
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.create(req, res);

  expect(mockCreate).toHaveBeenCalledWith(req.body);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "SKU já cadastrado",
  });
});

it("deve atualizar um produto com sucesso", async () => {
  const updateData = {
    name: "Anel de Ouro Atualizado",
    price: 180000,
    stock: 8,
  };

  const updatedProduct = {
    id: 1,
    name: "Anel de Ouro Atualizado",
    price: 180000,
    stock: 8,
    sku: "ANEL-001",
    categoryId: 1,
    active: true,
  };

  mockUpdate.mockResolvedValue(updatedProduct);

  const req = {
    params: {
      id: "1",
    },
    body: updateData,
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.update(req, res);

  expect(mockUpdate).toHaveBeenCalledWith(1, updateData);

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith(updatedProduct);
});

it("deve retornar 400 quando o id do produto for inválido", async () => {
  const req = {
    params: {
      id: "abc",
    },
    body: {
      name: "Anel de Ouro",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.update(req, res);

  expect(mockUpdate).not.toHaveBeenCalled();

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "ID do produto inválido",
  });
});

it("deve excluir um produto com sucesso", async () => {
  mockDelete.mockResolvedValue(undefined);

  const req = {
    params: {
      id: "1",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.delete(req, res);

  expect(mockDelete).toHaveBeenCalledWith(1);

  expect(res.status).toHaveBeenCalledWith(204);

  expect(res.send).toHaveBeenCalledWith();
});

it("deve retornar 404 quando o produto não for encontrado", async () => {
  mockDelete.mockRejectedValue(new Error("Produto não encontrado"));

  const req = {
    params: {
      id: "999",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.delete(req, res);

  expect(mockDelete).toHaveBeenCalledWith(999);

  expect(res.status).toHaveBeenCalledWith(404);

  expect(res.json).toHaveBeenCalledWith({
    message: "Produto não encontrado",
  });
});

it("deve retornar 400 quando o id do produto for inválido ao excluir", async () => {
  const req = {
    params: {
      id: "abc",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.delete(req, res);

  expect(mockDelete).not.toHaveBeenCalled();

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "ID do produto inválido",
  });
});

it("deve retornar 500 quando ocorrer um erro interno ao excluir", async () => {
  mockDelete.mockRejectedValue("erro inesperado");

  const req = {
    params: {
      id: "1",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.delete(req, res);

  expect(mockDelete).toHaveBeenCalledWith(1);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Erro interno do servidor",
  });
});

it("deve retornar 400 quando ocorrer um erro ao atualizar o produto", async () => {
  mockUpdate.mockRejectedValue(new Error("SKU já cadastrado"));

  const req = {
    params: {
      id: "1",
    },
    body: {
      sku: "SKU-EXISTENTE",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.update(req, res);

  expect(mockUpdate).toHaveBeenCalledWith(1, req.body);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "SKU já cadastrado",
  });
});

it("deve retornar 500 quando ocorrer um erro interno ao criar o produto", async () => {
  mockCreate.mockRejectedValue("erro inesperado");

  const req = {
    body: {
      name: "Colar de Ouro",
      price: 250000,
      stock: 5,
      sku: "COLAR-001",
      categoryId: 1,
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.create(req, res);

  expect(mockCreate).toHaveBeenCalledWith(req.body);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Erro interno do servidor",
  });
});

it("deve retornar 500 quando ocorrer um erro interno ao atualizar o produto", async () => {
  mockUpdate.mockRejectedValue("erro inesperado");

  const req = {
    params: {
      id: "1",
    },
    body: {
      name: "Anel de Ouro",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.update(req, res);

  expect(mockUpdate).toHaveBeenCalledWith(1, req.body);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Erro interno do servidor",
  });
});

it("deve listar produtos usando apenas preço mínimo", async () => {
  mockFindAll.mockResolvedValue({
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  });

  const req = {
    query: {
      minPrice: "100000",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.findAll(req, res);

  expect(mockFindAll).toHaveBeenCalledWith(1, 10, {
    minPrice: 100000,
  });

  expect(res.status).toHaveBeenCalledWith(200);
});

it("deve listar produtos usando apenas preço máximo", async () => {
  mockFindAll.mockResolvedValue({
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  });

  const req = {
    query: {
      maxPrice: "200000",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new ProductController();

  await controller.findAll(req, res);

  expect(mockFindAll).toHaveBeenCalledWith(1, 10, {
    maxPrice: 200000,
  });

  expect(res.status).toHaveBeenCalledWith(200);
});
