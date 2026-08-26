import { z } from "zod";

export const globalRecipientSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  active: z.boolean(),
  created_at: z.string(),
});

export const globalRecipientCreateSchema = z.object({
  email: z.string().trim().email("E-mail inválido."),
});

export type GlobalRecipientCreateInput = z.infer<typeof globalRecipientCreateSchema>;
