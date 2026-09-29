import { db } from "../prisma/db";
import type { TransactionContext } from "../prisma/transaction";

export class ProductRepository {
  async findAll(
    page: number,
    limit: number,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    const offset = (page - 1) * limit;

    let query = db.orm.public.Product.where({
      active: true,
    });

    if (filters?.minPrice !== undefined) {
      query = query.where((product) => product.price.gte(filters.minPrice!));
    }

    if (filters?.maxPrice !== undefined) {
      query = query.where((product) => product.price.lte(filters.maxPrice!));
    }

    const products = await query
      .orderBy((product) => product.id.asc())
      .offset(offset)
      .limit(limit)
      .all();

    const result = await query.aggregate((agg) => ({
      total: agg.count(),
    }));

    return {
      products,
      total: result.total,
    };
  }

  async findById(id: number, tx?: TransactionContext) {
    const orm = tx?.orm ?? db.orm;

    return orm.public.Product.first({ id });
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
    imageUrl?: string;
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
      imageUrl?: string;
      categoryId?: number;
    },
  ) {
    return db.orm.public.Product.where({ id }).update(data);
  }

  async delete(id: number) {
    return db.orm.public.Product.where({ id }).update({
      active: false,
    });
  }

  async updateStock(id: number, stock: number, tx?: TransactionContext) {
    const orm = tx?.orm ?? db.orm;

    return orm.public.Product.where({ id }).update({ stock });
  }
}
