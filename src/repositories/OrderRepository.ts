import { db } from "../prisma/db";

export class OrderRepository {
  async create(data: { userId: number; total: number; status: string }) {
    return db.orm.public.Order.create(data);
  }

  async createItem(data: {
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
  }) {
    return db.orm.public.OrderItem.create(data);
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
}
