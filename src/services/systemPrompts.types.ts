// ============================================================================
// System Prompts API — TypeScript types
// Contract: /api/v1/system-prompts/* endpoints (EDI-71, backend already implemented)
// Source: specs/029-system-prompts-panel/contracts/api-contracts.md
// ============================================================================

import type { ApiErrorCode, Blocker } from "@/lib/apiError";

export type { ApiErrorCode, Blocker };

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export type SystemPromptKey =
  | "routing_agent"
  | "groundedness_rule"
  | "chitchat_no_knowledge_rule"
  | "booking_integrity_rule";

export interface SystemPrompt {
  id: string;
  prompt_key: SystemPromptKey;
  titulo: string;
  current_version: string;
  last_version: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Request Inputs
// ---------------------------------------------------------------------------

export interface SystemPromptUpdateInput {
  conteudo: string;
}

// ---------------------------------------------------------------------------
// Union Result Types
// ---------------------------------------------------------------------------

export type SystemPromptsResult<T> =
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

export type SystemPromptListResult = SystemPromptsResult<SystemPrompt[]>;
export type SystemPromptSingleResult = SystemPromptsResult<SystemPrompt>;
