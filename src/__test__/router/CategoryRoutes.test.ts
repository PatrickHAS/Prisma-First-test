import express from "express";
import request from "supertest";

const mockFindAllCategories = jest.fn();

jest.mock("../../services/CategoryService", () => ({
  CategoryService: jest.fn().mockImplementation(() => ({
    findAll: (...args: unknown[]) => mockFindAllCategories(...args),
  })),
}));

import categoryRoutes from "../../routes/CategoryRoutes";

const app = express();

app.use(express.json());
app.use("/categories", categoryRoutes);

describe("CategoryRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve listar todas as categorias", async () => {
    const categories = [
      {
        id: 1,
        name: "Anéis",
        description: "Anéis de luxo",
      },
      {
        id: 2,
        name: "Colares",
        description: "Colares de luxo",
      },
    ];

    mockFindAllCategories.mockResolvedValue(categories);

    const response = await request(app).get("/categories");

    expect(mockFindAllCategories).toHaveBeenCalledTimes(1);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(categories);
  });
});
