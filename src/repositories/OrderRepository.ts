import { db } from "../prisma/db";
import type { TransactionContext } from "../prisma/transaction";

type DbClient = typeof db;

export class OrderRepository {
  async create(
    data: {
      userId: number;
      total: number;
      status: string;
    },
    tx?: TransactionContext,
  ) {
    const orm = tx?.orm ?? db.orm;

    return orm.public.Order.create(data);
  }

  async createItem(
    data: {
      orderId: number;
      productId: number;
      quantity: number;
      unitPrice: number;
    },
    tx?: TransactionContext,
  ) {
    const orm = tx?.orm ?? db.orm;

    return orm.public.OrderItem.create(data);
  }

  async findById(id: number) {
    return db.orm.public.Order.first({ id });
  }

  async findByIdAndUserId(id: number, userId: number) {
    return db.orm.public.Order.where({
      id,
      userId,
    })
      .include("items", (item) => item.include("product"))
      .first();
  }

  async findByUserId(userId: number) {
    return db.orm.public.Order.where({ userId })
      .include("items", (item) => item.include("product"))
      .orderBy((order) => order.id.desc())
      .all();
  }

  async createWithTransaction(
    tx: typeof db,
    data: {
      userId: number;
      total: number;
      status: string;
    },
  ) {
    return tx.orm.public.Order.create(data);
  }

  async createItemWithTransaction(
    tx: typeof db,
    data: {
      orderId: number;
      productId: number;
      quantity: number;
      unitPrice: number;
    },
  ) {
    return tx.orm.public.OrderItem.create(data);
  }
}
