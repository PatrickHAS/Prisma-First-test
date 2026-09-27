import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),

  description: z.string().optional(),

  price: z.number().positive("O preço deve ser maior que zero"),

  stock: z.number().int().nonnegative("O estoque não pode ser negativo"),

  sku: z.string().min(1, "SKU é obrigatório"),

  active: z.boolean().optional(),

  categoryId: z.number().int().positive(),
});

export const updateProductSchema = createProductSchema.partial();
