import { z } from "zod";

const domainPattern = /^(?=.{1,253}$)(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63})$/i;

export const tenantDomainSchema = z
  .string()
  .trim()
  .min(1, "Informe um domínio.")
  .regex(domainPattern, "Informe apenas o domínio, sem http, https, porta ou caminho.");

export const tenantWriteSchema = z.object({
  name: z.string().trim().min(1, "O nome do tenant é obrigatório."),
  google_calendar_id: z
    .string()
    .trim()
    .min(1, "O ID do Google Calendar é obrigatório."),
  allowed_domains: z
    .array(tenantDomainSchema)
    .min(1, "Adicione pelo menos um domínio permitido."),
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