import { db } from "../prisma/db";

export class ProductRepository {
  async findAll() {
    return db.orm.public.Product.all();
  }

  async findById(id: number) {
    return db.orm.public.Product.first({ id });
  }

  async findBySku(sku: string) {
    return db.orm.public.Product.first({ sku });
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
    return db.orm.public.Product.create(data);
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
    return db.orm.public.Product.where({ id }).update(data);
  }

  async delete(id: number) {
    return db.orm.public.Product.where({ id }).delete();
  }
}
