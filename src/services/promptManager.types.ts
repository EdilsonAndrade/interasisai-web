// ============================================================================
// Prompt Manager API — TypeScript types
// Contract: /prompt-manager/* endpoints
// Source: specs/015-admin-prompt-guardrails/data-model.md
// Node targeting (EDI-42): specs/018-guardrail-node-targets — node_type mirrors
// the backend's app/schemas/prompt_manager.py::NodeType (agendamento-ia repo).
// ============================================================================

import type { ApiErrorCode, Blocker } from "@/lib/apiError";

export type { ApiErrorCode, Blocker };

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export type NodeType = "operational" | "institutional" | "chitchat";

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
  node_type: NodeType;
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
  node_type: NodeType;
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
  node_type: NodeType;
  prompt_id: string;
  is_active: boolean;
  custom_content_override: string | null;
  prompt_titulo: string;
  prompt_conteudo: string;
  is_default_prompt: boolean;
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
      code?: ApiErrorCode;
      message: string;
      blockers: Blocker[];
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
