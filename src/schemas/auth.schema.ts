import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),

  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),

  name: z.string().min(1, "Nome é obrigatório").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});
