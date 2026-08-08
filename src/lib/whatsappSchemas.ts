import { z } from "zod";

export const adminLoginSchema = z.object({
  user: z.string().trim().min(1, "O usuário é obrigatório."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export const whatsappInstanceSchema = z.object({
  tenantId: z.string().trim().min(1, "O Tenant ID é obrigatório."),
  instanceName: z
    .string()
    .trim()
    .min(1, "O nome da instância é obrigatório."),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type WhatsAppInstanceInput = z.infer<typeof whatsappInstanceSchema>;