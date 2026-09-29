import express from "express";
import request from "supertest";
import productRoutes from "../../routes/ProductsRoutes";
import { AppError } from "../../errors/AppError";
import { errorMiddleware } from "../../middlewares/ErrorMiddleware";

const mockVerifyToken = jest.fn();
const mockCreateProduct = jest.fn();
const mockFindAllProducts = jest.fn();
const mockFindProductById = jest.fn();
const mockUpdateProduct = jest.fn();
const mockDeleteProduct = jest.fn();

jest.mock("../../services/ProductService", () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    findAll: (...args: unknown[]) => mockFindAllProducts(...args),
    findById: (...args: unknown[]) => mockFindProductById(...args),
    create: (...args: unknown[]) => mockCreateProduct(...args),
    update: (...args: unknown[]) => mockUpdateProduct(...args),
    delete: (...args: unknown[]) => mockDeleteProduct(...args),
  })),
}));

jest.mock("../../services/TokenService", () => ({
  TokenService: jest.fn().mockImplementation(() => ({
    verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
    generateToken: jest.fn(),
  })),
}));

const app = express();

app.use(express.json());
app.use(productRoutes);
app.use(errorMiddleware);

describe("ProductRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve bloquear criação de produto quando o token não for informado", async () => {
    const response = await request(app).post("/products").send({
      name: "Anel de Ouro",
      description: "Anel de ouro 18k",
      price: 159990,
      stock: 10,
      sku: "ANEL-TEST-001",
      categoryId: 1,
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Token não informado",
    });
  });

  it("deve bloquear atualização de produto quando o token não for informado", async () => {
    const response = await request(app).patch("/products/1").send({
      name: "Anel de Ouro Atualizado",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Token não informado",
    });
  });

  it("deve bloquear exclusão de produto quando o token não for informado", async () => {
    const response = await request(app).delete("/products/1");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Token não informado",
    });
  });

  it("deve bloquear criação de produto para usuário sem role ADMIN", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    const response = await request(app)
      .post("/products")
      .set("Authorization", "Bearer token-user")
      .send({
        name: "Anel de Ouro",
        description: "Anel de ouro 18k",
        price: 159990,
        stock: 10,
        sku: "ANEL-TEST-001",
        categoryId: 1,
      });

    expect(mockVerifyToken).toHaveBeenCalledWith("token-user");

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      message: "Acesso negado",
    });
  });

  it("deve permitir criação de produto para usuário ADMIN", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    const productData = {
      name: "Anel de Ouro",
      description: "Anel de ouro 18k",
      price: 159990,
      stock: 10,
      sku: "ANEL-ADMIN-001",
      categoryId: 1,
    };

    const createdProduct = {
      id: 1,
      ...productData,
      active: true,
    };

    mockCreateProduct.mockResolvedValue(createdProduct);

    const response = await request(app)
      .post("/products")
      .set("Authorization", "Bearer token-admin")
      .send(productData);

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(mockCreateProduct).toHaveBeenCalledWith(productData);

    expect(response.status).toBe(201);

    expect(response.body).toEqual(createdProduct);
  });

  it("deve bloquear criação de produto com dados inválidos", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    const response = await request(app)
      .post("/products")
      .set("Authorization", "Bearer token-admin")
      .send({
        name: "",
        price: -100,
        stock: -1,
        sku: "",
        categoryId: 0,
      });

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Dados inválidos");

    expect(response.body.errors).toBeDefined();

    expect(mockCreateProduct).not.toHaveBeenCalled();
  });

  it("deve listar produtos sem exigir autenticação", async () => {
    const serviceResponse = {
      data: [
        {
          id: 1,
          name: "Anel de Ouro",
          description: "Anel de ouro 18k",
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
    };

    mockFindAllProducts.mockResolvedValue(serviceResponse);

    const response = await request(app).get("/products");

    expect(response.status).toBe(200);

    expect(mockFindAllProducts).toHaveBeenCalledWith(1, 10, {});

    expect(response.body).toEqual(serviceResponse);
  });

  it("deve listar produtos utilizando paginação e filtros de preço", async () => {
    const serviceResponse = {
      data: [
        {
          id: 1,
          name: "Anel de Ouro",
          description: "Anel de ouro 18k",
          price: 159990,
          stock: 10,
          sku: "ANEL-001",
          active: true,
          categoryId: 1,
        },
      ],
      pagination: {
        page: 2,
        limit: 5,
        total: 6,
        totalPages: 2,
      },
    };

    mockFindAllProducts.mockResolvedValue(serviceResponse);

    const response = await request(app).get("/products").query({
      page: 2,
      limit: 5,
      minPrice: 100000,
      maxPrice: 200000,
    });

    expect(response.status).toBe(200);

    expect(mockFindAllProducts).toHaveBeenCalledWith(2, 5, {
      minPrice: 100000,
      maxPrice: 200000,
    });

    expect(response.body).toEqual(serviceResponse);
  });

  it("deve retornar 400 quando a página for inválida", async () => {
    mockFindAllProducts.mockRejectedValue(new AppError("Página inválida", 400));

    const response = await request(app).get("/products").query({
      page: "abc",
    });

    expect(mockFindAllProducts).toHaveBeenCalledWith(NaN, 10, {});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Página inválida",
    });
  });

  it("deve retornar 400 quando o ID do produto for inválido", async () => {
    const response = await request(app).get("/products/abc");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "ID inválido",
    });

    expect(mockFindProductById).not.toHaveBeenCalled();
  });

  it("deve buscar um produto por ID válido", async () => {
    const product = {
      id: 1,
      name: "Anel de Ouro",
      description: "Anel de ouro 18k",
      price: 159990,
      stock: 10,
      sku: "ANEL-001",
      active: true,
      categoryId: 1,
    };

    mockFindProductById.mockResolvedValue(product);

    const response = await request(app).get("/products/1");

    expect(mockFindProductById).toHaveBeenCalledWith(1);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(product);
  });

  it("deve retornar 404 quando o produto não for encontrado", async () => {
    mockFindProductById.mockResolvedValue(null);

    const response = await request(app).get("/products/999");

    expect(mockFindProductById).toHaveBeenCalledWith(999);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Produto não encontrado",
    });
  });

  it("deve permitir atualização de produto para usuário ADMIN", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    const updateData = {
      name: "Anel de Ouro Atualizado",
      price: 169990,
    };

    const updatedProduct = {
      id: 1,
      name: "Anel de Ouro Atualizado",
      description: "Anel de ouro 18k",
      price: 169990,
      stock: 10,
      sku: "ANEL-001",
      active: true,
      categoryId: 1,
    };

    mockUpdateProduct.mockResolvedValue(updatedProduct);

    const response = await request(app)
      .patch("/products/1")
      .set("Authorization", "Bearer token-admin")
      .send(updateData);

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(mockUpdateProduct).toHaveBeenCalledWith(1, updateData);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(updatedProduct);
  });

  it("deve bloquear atualização de produto para usuário sem role ADMIN", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    const response = await request(app)
      .patch("/products/1")
      .set("Authorization", "Bearer token-user")
      .send({
        name: "Anel de Ouro Atualizado",
        price: 169990,
      });

    expect(mockVerifyToken).toHaveBeenCalledWith("token-user");

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      message: "Acesso negado",
    });

    expect(mockUpdateProduct).not.toHaveBeenCalled();
  });

  it("deve retornar 400 ao atualizar produto com ID inválido", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    const response = await request(app)
      .patch("/products/abc")
      .set("Authorization", "Bearer token-admin")
      .send({
        name: "Anel de Ouro Atualizado",
      });

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "ID inválido",
    });

    expect(mockUpdateProduct).not.toHaveBeenCalled();
  });

  it("deve bloquear atualização de produto com dados inválidos", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    const response = await request(app)
      .patch("/products/1")
      .set("Authorization", "Bearer token-admin")
      .send({
        name: "",
        price: -100,
        stock: -1,
        categoryId: 0,
      });

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Dados inválidos");

    expect(response.body.errors).toBeDefined();

    expect(mockUpdateProduct).not.toHaveBeenCalled();
  });

  it("deve retornar erro quando o produto não for encontrado na atualização", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    mockUpdateProduct.mockRejectedValue(
      new AppError("Produto não encontrado", 404),
    );

    const updateData = {
      name: "Anel de Ouro Atualizado",
    };

    const response = await request(app)
      .patch("/products/999")
      .set("Authorization", "Bearer token-admin")
      .send(updateData);

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(mockUpdateProduct).toHaveBeenCalledWith(999, updateData);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Produto não encontrado",
    });
  });

  it("deve permitir exclusão de produto para usuário ADMIN", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    mockDeleteProduct.mockResolvedValue({
      id: 1,
      active: false,
    });

    const response = await request(app)
      .delete("/products/1")
      .set("Authorization", "Bearer token-admin");

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(mockDeleteProduct).toHaveBeenCalledWith(1);

    expect(response.status).toBe(204);

    expect(response.body).toEqual({});
  });

  it("deve bloquear exclusão de produto para usuário sem role ADMIN", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 2,
      role: "USER",
    });

    const response = await request(app)
      .delete("/products/1")
      .set("Authorization", "Bearer token-user");

    expect(mockVerifyToken).toHaveBeenCalledWith("token-user");

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      message: "Acesso negado",
    });

    expect(mockDeleteProduct).not.toHaveBeenCalled();
  });

  it("deve retornar 400 ao excluir produto com ID inválido", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    const response = await request(app)
      .delete("/products/abc")
      .set("Authorization", "Bearer token-admin");

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "ID inválido",
    });

    expect(mockDeleteProduct).not.toHaveBeenCalled();
  });

  it("deve retornar 404 ao excluir produto não encontrado", async () => {
    mockVerifyToken.mockResolvedValue({
      userId: 1,
      role: "ADMIN",
    });

    mockDeleteProduct.mockRejectedValue(
      new AppError("Produto não encontrado", 404),
    );

    const response = await request(app)
      .delete("/products/999")
      .set("Authorization", "Bearer token-admin");

    expect(mockVerifyToken).toHaveBeenCalledWith("token-admin");

    expect(mockDeleteProduct).toHaveBeenCalledWith(999);

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Produto não encontrado",
    });
  });
});
