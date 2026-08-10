// ============================================================================
// Prompt Manager — Component-level types
// ============================================================================

import type { EditorMode } from "./MarkdownEditorCustom";

export type { EditorMode };
export type ModalMode = "create" | "edit" | null;
export type TabId = "prompts" | "guardrails" | "tenant-link";

export type ConfirmDeleteTarget = {
  id: string;
  titulo: string;
  type: "guardrail" | "prompt";
} | null;
