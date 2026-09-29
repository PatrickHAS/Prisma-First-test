import { ProductRepository } from "../repositories/ProductRepository";
import { AppError } from "../errors/AppError";

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async findAll(
    page: number,
    limit: number,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    if (!Number.isInteger(page) || page < 1) {
      throw new AppError("Página inválida", 400);
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new AppError("O limite deve estar entre 1 e 100", 400);
    }

    if (
      filters?.minPrice !== undefined &&
      (!Number.isFinite(filters.minPrice) || filters.minPrice < 0)
    ) {
      throw new AppError("Preço mínimo inválido", 400);
    }

    if (
      filters?.maxPrice !== undefined &&
      (!Number.isFinite(filters.maxPrice) || filters.maxPrice < 0)
    ) {
      throw new AppError("Preço máximo inválido", 400);
    }

    if (
      filters?.minPrice !== undefined &&
      filters?.maxPrice !== undefined &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new AppError(
        "O preço mínimo não pode ser maior que o preço máximo",
        400,
      );
    }

    const products = await this.productRepository.findAll(page, limit, filters);

    const totalPages = Math.ceil(products.total / limit);

    return {
      data: products.products,
      pagination: {
        page,
        limit,
        total: products.total,
        totalPages,
      },
    };
  }

  async findById(id: number) {
    return this.productRepository.findById(id);
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    sku: string;
    active?: boolean;
    imageUrl?: string;
    categoryId: number;
  }) {
    if (!data.name || data.name.trim() === "") {
      throw new AppError("Nome do produto é obrigatório", 400);
    }

    if (data.price <= 0) {
      throw new AppError("O preço deve ser maior que zero", 400);
    }

    if (data.stock < 0) {
      throw new AppError("O estoque não pode ser negativo", 400);
    }

    if (!data.sku || data.sku.trim() === "") {
      throw new AppError("SKU é obrigatório", 400);
    }

    const existingProduct = await this.productRepository.findBySku(data.sku);

    if (existingProduct) {
      throw new AppError("SKU já cadastrado", 400);
    }

    return this.productRepository.create(data);
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      sku?: string;
      active?: boolean;
      imageUrl?: string;
      categoryId?: number;
    },
  ) {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new AppError("Produto não encontrado", 404);
    }

    if (data.price !== undefined && data.price <= 0) {
      throw new AppError("O preço deve ser maior que zero", 400);
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new AppError("O estoque não pode ser negativo", 400);
    }

    if (data.name !== undefined && data.name.trim() === "") {
      throw new AppError("Nome do produto não pode ser vazio", 400);
    }

    if (data.sku !== undefined) {
      if (data.sku.trim() === "") {
        throw new AppError("SKU não pode ser vazio", 400);
      }

      const productWithSameSku = await this.productRepository.findBySku(
        data.sku,
      );

      if (productWithSameSku && productWithSameSku.id !== id) {
        throw new AppError("SKU já cadastrado", 400);
      }
    }

    return this.productRepository.update(id, data);
  }

  async delete(id: number) {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new AppError("Produto não encontrado", 404);
    }

    return this.productRepository.delete(id);
  }
}
