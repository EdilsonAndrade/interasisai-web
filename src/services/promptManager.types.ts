// ============================================================================
// Prompt Manager API — TypeScript types
// Contract: /prompt-manager/* endpoints
// Source: specs/015-admin-prompt-guardrails/data-model.md
// ============================================================================

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Guardrail {
  id: string;
  titulo: string;
  conteudo: string;
  is_global: boolean;
}

export interface Prompt {
  id: string;
  titulo: string;
  conteudo: string;
  is_default: boolean;
  guardrail_ids: string[];
  guardrails?: Guardrail[];
  guardrails_associados?: Guardrail[];
}

// ---------------------------------------------------------------------------
// Request Inputs
// ---------------------------------------------------------------------------

export interface GuardrailCreateInput {
  titulo: string;
  conteudo: string;
  is_global: boolean;
}

export type GuardrailUpdateInput = GuardrailCreateInput;

export interface PromptCreateInput {
  titulo: string;
  conteudo: string;
  is_default: boolean;
  guardrail_ids: string[];
}

export type PromptUpdateInput = PromptCreateInput;

export interface TenantLinkInput {
  tenant_id: string;
  prompt_id: string;
  custom_content_override?: string;
}

// ---------------------------------------------------------------------------
// Tenant Prompt Detail (GET /tenant/{tenant_id})
// ---------------------------------------------------------------------------

export interface TenantPromptDetail {
  tenant_id: string;
  prompt_id: string;
  is_active: boolean;
  custom_content_override: string | null;
  prompt_titulo: string;
  prompt_conteudo_base: string;
  prompt_is_default: boolean;
  // Contract field from specs/017-tenant-search-knowledge-base/contracts/admin-api-contract.md.
  // Optional/additive: read defensively alongside `prompt_is_default` (see useTenantContext)
  // since the two names may not both be sent by every backend revision.
  is_default_prompt?: boolean;
  guardrails_associados: Guardrail[];
}

// ---------------------------------------------------------------------------
// Union Result Types
// ---------------------------------------------------------------------------

export type PromptManagerResult<T> =
  | { ok: true; status: number; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      fieldErrors?: Record<string, string>;
      retryable: boolean;
    };

export type GuardrailListResult = PromptManagerResult<Guardrail[]>;
export type GuardrailSingleResult = PromptManagerResult<Guardrail>;
export type PromptListResult = PromptManagerResult<Prompt[]>;
export type PromptSingleResult = PromptManagerResult<Prompt>;
export type TenantLinkResult = PromptManagerResult<null>;
export type TenantPromptDetailResult = PromptManagerResult<TenantPromptDetail>;
export type DeleteResult = PromptManagerResult<null>;
