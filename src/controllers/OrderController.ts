import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  async create(req: Request, res: Response) {
    const userId = req.userId!;

    const { items } = req.body;

    const order = await this.orderService.createOrder(userId, items);

    return res.status(201).json(order);
  }

  async findAll(req: Request, res: Response) {
    const userId = req.userId!;

    const orders = await this.orderService.findOrdersByUser(userId);

    return res.status(200).json({
      data: orders,
    });
  }

  async findById(req: Request, res: Response) {
    const userId = req.userId!;

    const id = Number(req.params.id);

    const order = await this.orderService.findOrderById(id, userId);

    return res.status(200).json(order);
  }
}
