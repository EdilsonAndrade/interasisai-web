// ============================================================================
// System Prompts admin UI — local component types
// ============================================================================

import type { SystemPrompt } from "@/services/systemPrompts.types";

export interface SystemPromptListProps {
  prompts: SystemPrompt[];
  selectedPromptKey: string | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelect: (promptKey: string) => void;
}

export interface SystemPromptEditorProps {
  prompt: SystemPrompt;
  saving: boolean;
  rollingBack: boolean;
  onSave: (conteudo: string) => Promise<boolean>;
  onRollback: () => Promise<boolean>;
}
