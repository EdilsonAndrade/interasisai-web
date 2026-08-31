// ============================================================================
// SystemPromptsPage — Client orchestrator: lista + seleção + editor
// ============================================================================

"use client";

import { Toaster } from "sonner";
import { useSystemPrompts } from "@/hooks/useSystemPrompts";
import { SystemPromptList } from "./SystemPromptList";
import { SystemPromptEditor } from "./SystemPromptEditor";

export function SystemPromptsPage() {
  const {
    prompts,
    state,
    error,
    selectedPromptKey,
    selectPrompt,
    refresh,
    savingKey,
    rollingBackKey,
    savePrompt,
    rollbackPrompt,
  } = useSystemPrompts();

  const selectedPrompt = prompts.find((p) => p.prompt_key === selectedPromptKey) ?? null;

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 px-4 py-16 sm:px-6" aria-live="polite">
      <Toaster richColors position="top-right" />

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-text-strong sm:text-4xl">Prompts do Sistema</h1>
        <p className="text-sm text-text-body">
          Edite e reverta os prompts hoje hardcoded no agente de IA, com versionamento
          automático da última alteração.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,260px)_1fr]">
        <SystemPromptList
          prompts={prompts}
          selectedPromptKey={selectedPromptKey}
          loading={state === "loading"}
          error={error}
          onRefresh={refresh}
          onSelect={selectPrompt}
        />

        {selectedPrompt && (
          <SystemPromptEditor
            key={selectedPrompt.prompt_key}
            prompt={selectedPrompt}
            saving={savingKey === selectedPrompt.prompt_key}
            rollingBack={rollingBackKey === selectedPrompt.prompt_key}
            onSave={(conteudo) => savePrompt(selectedPrompt.prompt_key, conteudo)}
            onRollback={() => rollbackPrompt(selectedPrompt.prompt_key)}
          />
        )}
      </div>
    </section>
  );
}
