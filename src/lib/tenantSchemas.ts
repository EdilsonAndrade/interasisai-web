import { z } from "zod";

export const tenantWriteSchema = z.object({
  name: z.string().trim().min(1, "O nome do tenant é obrigatório."),
  google_calendar_id: z
    .string()
    .trim()
    .min(1, "O ID do Google Calendar é obrigatório."),
});

export const tenantCreateSchema = tenantWriteSchema.extend({
  tenant_id: z.string().trim().min(1, "O ID do tenant é obrigatório."),
});

export const tenantLookupSchema = z.object({
  tenantId: z.string().trim().min(1, "O ID do tenant é obrigatório."),
});

export type TenantWriteInput = z.infer<typeof tenantWriteSchema>;
export type TenantCreateInput = z.infer<typeof tenantCreateSchema>;
export type TenantLookupInput = z.infer<typeof tenantLookupSchema>;