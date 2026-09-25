import { ProductRepository } from "../repositories/ProductRepository";

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async findAll() {
    return this.productRepository.findAll();
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
    categoryId: number;
  }) {
    if (!data.name || data.name.trim() === "") {
      throw new Error("Nome do produto é obrigatório");
    }

    if (data.price <= 0) {
      throw new Error("O preço deve ser maior que zero");
    }

    if (data.stock < 0) {
      throw new Error("O estoque não pode ser negativo");
    }

    if (!data.sku || data.sku.trim() === "") {
      throw new Error("SKU é obrigatório");
    }

    const existingProduct = await this.productRepository.findBySku(data.sku);

    if (existingProduct) {
      throw new Error("SKU já cadastrado");
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
      categoryId?: number;
    },
  ) {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new Error("Produto não encontrado");
    }

    if (data.price !== undefined && data.price <= 0) {
      throw new Error("O preço deve ser maior que zero");
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error("O estoque não pode ser negativo");
    }

    if (data.name !== undefined && data.name.trim() === "") {
      throw new Error("Nome do produto não pode ser vazio");
    }

    if (data.sku !== undefined) {
      if (data.sku.trim() === "") {
        throw new Error("SKU não pode ser vazio");
      }

      const productWithSameSku = await this.productRepository.findBySku(
        data.sku,
      );

      if (productWithSameSku && productWithSameSku.id !== id) {
        throw new Error("SKU já cadastrado");
      }
    }

    return this.productRepository.update(id, data);
  }

  async delete(id: number) {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new Error("Produto não encontrado");
    }

    return this.productRepository.delete(id);
  }
}
