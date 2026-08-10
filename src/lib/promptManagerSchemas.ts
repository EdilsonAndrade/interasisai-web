// ============================================================================
// Prompt Manager — Zod schemas & inferred types
// Zod v4: use .trim().min(1) instead of .nonempty()
// ============================================================================

import { z } from "zod";

export const guardrailFormSchema = z.object({
  titulo: z.string().trim().min(1, "Título é obrigatório"),
  conteudo: z.string().trim().min(1, "Conteúdo é obrigatório"),
  is_global: z.boolean(),
});

export const promptFormSchema = z.object({
  titulo: z.string().trim().min(1, "Título é obrigatório"),
  conteudo: z.string().trim().min(1, "Conteúdo é obrigatório"),
  is_default: z.boolean(),
  guardrail_ids: z.array(z.string()),
});

export const tenantLinkSchema = z.object({
  tenant_id: z.string().trim().min(1, "ID do tenant é obrigatório"),
  prompt_id: z.string().min(1, "Prompt é obrigatório"),
  custom_content_override: z.string().optional(),
});

// Inferred types for react-hook-form
export type GuardrailFormData = z.infer<typeof guardrailFormSchema>;
export type PromptFormData = z.infer<typeof promptFormSchema>;
export type TenantLinkFormData = z.infer<typeof tenantLinkSchema>;
