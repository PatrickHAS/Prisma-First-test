import { db } from "../prisma/db";
import { AppError } from "../errors/AppError";
import { OrderRepository } from "../repositories/OrderRepository";
import { ProductRepository } from "../repositories/ProductRepository";

export class OrderService {
  private orderRepository: OrderRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
  }

  async createOrder(
    userId: number,
    items: {
      productId: number;
      quantity: number;
    }[],
  ) {
    if (items.length === 0) {
      throw new AppError("O pedido deve possuir pelo menos um item", 400);
    }

    const productIds = items.map((item) => item.productId);

    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      throw new AppError(
        "O mesmo produto não pode ser adicionado mais de uma vez ao pedido",
        400,
      );
    }

    let total = 0;

    const orderItems: {
      productId: number;
      quantity: number;
      unitPrice: number;
      stock: number;
    }[] = [];

    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product) {
        throw new AppError(`Produto ${item.productId} não encontrado`, 404);
      }
      if (product.active === false) {
        throw new AppError("Produto não está disponível para venda", 400);
      }

      if (item.quantity <= 0) {
        throw new AppError("A quantidade deve ser maior que zero", 400);
      }

      if (item.quantity > product.stock) {
        throw new AppError(
          `Estoque insuficiente para o produto ${product.name}`,
          400,
        );
      }

      total += product.price * item.quantity;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        stock: product.stock,
      });
    }

    const order = await db.transaction(async (tx) => {
      const createdOrder = await this.orderRepository.create(
        {
          userId,
          total,
          status: "PENDING",
        },
        tx,
      );

      for (const item of orderItems) {
        await this.orderRepository.createItem(
          {
            orderId: createdOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
          tx,
        );
      }

      for (const item of orderItems) {
        await this.productRepository.updateStock(
          item.productId,
          item.stock - item.quantity,
          tx,
        );
      }

      return createdOrder;
    });

    return {
      id: order.id,
      userId: order.userId,
      total: order.total,
      status: order.status,
    };
  }

  async findOrdersByUser(userId: number) {
    return this.orderRepository.findByUserId(userId);
  }

  async findOrderById(id: number, userId: number) {
    const order = await this.orderRepository.findByIdAndUserId(id, userId);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    return order;
  }

  async cancelOrder(id: number, userId: number) {
    const order = await this.orderRepository.findByIdAndUserId(id, userId);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    if (order.status === "CANCELLED") {
      throw new AppError("Pedido já está cancelado", 400);
    }

    await db.transaction(async (tx) => {
      await this.orderRepository.updateStatus(order.id, "CANCELLED", tx);

      for (const item of order.items) {
        const product = await this.productRepository.findById(
          item.productId,
          tx,
        );

        if (!product) {
          throw new AppError(`Produto ${item.productId} não encontrado`, 404);
        }

        await this.productRepository.updateStock(
          item.productId,
          product.stock + item.quantity,
          tx,
        );
      }
    });

    return {
      id: order.id,
      status: "CANCELLED",
      total: order.total,
    };
  }
}
