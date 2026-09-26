import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),

        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "O pedido deve possuir pelo menos um item"),
});
