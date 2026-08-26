import { z } from "zod";

const domainPattern = /^(?=.{1,253}$)(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63})$/i;

export const tenantDomainSchema = z
  .string()
  .trim()
  .min(1, "Informe um domínio.")
  .regex(domainPattern, "Informe apenas o domínio, sem http, https, porta ou caminho.");

export const notificationEmailSchema = z
  .string()
  .trim()
  .email("E-mail inválido.");

export const tenantWriteSchema = z.object({
  name: z.string().trim().min(1, "O nome do tenant é obrigatório."),
  google_calendar_id: z
    .string()
    .trim()
    .min(1, "O ID do Google Calendar é obrigatório."),
  allowed_domains: z
    .array(tenantDomainSchema)
    .min(1, "Adicione pelo menos um domínio permitido."),
  scheduling_enabled: z.boolean(),
  // EDI-63: teto mensal de chamadas de LLM (opcional, null = sem limite) e
  // e-mails de aviso de consumo (opcional, lista vazia = nenhum aviso).
  monthly_message_limit: z
    .number({ error: "Informe um número inteiro." })
    .int("Informe um número inteiro.")
    .positive("O limite deve ser maior que zero.")
    .nullable(),
  notification_emails: z
    .array(notificationEmailSchema)
    .max(10, "Máximo de 10 e-mails."),
});

export const tenantCreateSchema = tenantWriteSchema.extend({
  tenant_id: z.string().trim().min(1, "O ID do tenant é obrigatório."),
  prompt_id: z
    .string()
    .trim()
    .min(
      1,
      "Selecione o prompt que este tenant vai usar. Sem prompt vinculado, o atendimento não funciona.",
    ),
});

export const tenantLookupSchema = z.object({
  tenantId: z.string().trim().min(1, "O ID do tenant é obrigatório."),
});

export const tenantSearchSchema = z.object({
  term: z.string().trim().min(1, "Informe um termo de busca."),
});

export type TenantWriteInput = z.infer<typeof tenantWriteSchema>;
export type TenantCreateInput = z.infer<typeof tenantCreateSchema>;
export type TenantLookupInput = z.infer<typeof tenantLookupSchema>;
export type TenantSearchInput = z.infer<typeof tenantSearchSchema>;