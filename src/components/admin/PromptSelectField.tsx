// ============================================================================
// PromptSelectField — combo de prompt operacional para o cadastro de tenant.
// Nunca pré-seleciona (FR-004); o prompt padrão é só rotulado (FR-005); e
// oferece o caminho "criar novo a partir de um modelo" (FR-007/FR-008).
// ============================================================================

"use client";

import { Sparkles, Star, X } from "lucide-react";
import { useId, useState } from "react";
import { MarkdownEditorCustom } from "@/components/admin/prompt-manager/MarkdownEditorCustom";
import { missingRequiredPlaceholders } from "@/lib/promptPlaceholders";
import type { Prompt, PromptCreateInput } from "@/services/promptManager.types";

type PromptSelectFieldProps = {
  prompts: Prompt[];
  selectedPromptId: string;
  newPromptDraft: PromptCreateInput | null;
  onSelectExisting: (promptId: string) => void;
  onNewPromptDraftChange: (draft: PromptCreateInput | null) => void;
  disabled?: boolean;
  error?: string;
};

export function PromptSelectField({
  prompts,
  selectedPromptId,
  newPromptDraft,
  onSelectExisting,
  onNewPromptDraftChange,
  disabled,
  error,
}: PromptSelectFieldProps) {
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const groupId = useId();

  const isNewMode = creatingFromTemplate || newPromptDraft !== null;
  const templatePrompt = prompts.find((p) => p.id === templateId);

  const emitDraft = (nextTitulo: string, nextConteudo: string, guardrailIds: string[]) => {
    if (!nextTitulo.trim() || !nextConteudo.trim()) {
      onNewPromptDraftChange(null);
      return;
    }
    onNewPromptDraftChange({
      titulo: nextTitulo,
      conteudo: nextConteudo,
      is_default: false,
      node_type: "operational",
      guardrail_ids: guardrailIds,
    });
  };

  const startFromTemplate = (id: string) => {
    const template = prompts.find((p) => p.id === id);
    if (!template) return;
    setTemplateId(id);
    setTitulo(template.titulo);
    setConteudo(template.conteudo);
    emitDraft(template.titulo, template.conteudo, template.guardrail_ids ?? []);
  };

  const cancelNewPrompt = () => {
    setCreatingFromTemplate(false);
    setTemplateId("");
    setTitulo("");
    setConteudo("");
    onNewPromptDraftChange(null);
  };

  if (isNewMode && !templateId) {
    return (
      <div className="space-y-3 rounded-card border border-brand-primary/20 bg-surface-base/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-strong">Escolha um modelo para partir</p>
          <button
            type="button"
            onClick={cancelNewPrompt}
            disabled={disabled}
            aria-label="Cancelar criação de novo prompt"
            className="rounded-full p-1 text-text-muted hover:bg-surface-subtle hover:text-text-strong disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <select
          defaultValue=""
          disabled={disabled || prompts.length === 0}
          onChange={(event) => startFromTemplate(event.target.value)}
          aria-label="Modelo de prompt"
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
        >
          <option value="" disabled>
            Selecione um modelo...
          </option>
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
              {p.is_default ? " (Padrão)" : ""}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (isNewMode && templateId) {
    const missingPlaceholders = missingRequiredPlaceholders(conteudo, "operational");
    return (
      <div className="space-y-3 rounded-card border border-brand-primary/20 bg-surface-base/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-strong">
            Novo prompt a partir de &ldquo;{templatePrompt?.titulo}&rdquo;
          </p>
          <button
            type="button"
            onClick={cancelNewPrompt}
            disabled={disabled}
            aria-label="Cancelar criação de novo prompt"
            className="rounded-full p-1 text-text-muted hover:bg-surface-subtle hover:text-text-strong disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${groupId}-titulo`} className="text-sm font-medium text-text-body">
            Título do novo prompt
          </label>
          <input
            id={`${groupId}-titulo`}
            value={titulo}
            disabled={disabled}
            onChange={(event) => {
              setTitulo(event.target.value);
              emitDraft(event.target.value, conteudo, templatePrompt?.guardrail_ids ?? []);
            }}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
          />
        </div>
        <MarkdownEditorCustom
          value={conteudo}
          onChange={(value) => {
            setConteudo(value);
            emitDraft(titulo, value, templatePrompt?.guardrail_ids ?? []);
          }}
          label="Conteúdo (Markdown)"
        />
        {missingPlaceholders.length > 0 && (
          <p role="alert" className="text-sm text-amber-300">
            Os placeholders obrigatórios{" "}
            {missingPlaceholders.map((token, index) => (
              <span key={token}>
                <code>{token}</code>
                {index < missingPlaceholders.length - 1 ? ", " : " "}
              </span>
            ))}
            não estão presentes neste texto. Funcionalidades ligadas a eles deixarão de funcionar
            dinamicamente para este tenant.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span id={groupId} className="text-sm font-medium text-text-body">
        Prompt
      </span>
      <div role="radiogroup" aria-labelledby={groupId} className="flex flex-col gap-2">
        {prompts.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selectedPromptId === p.id}
            disabled={disabled}
            onClick={() => onSelectExisting(p.id)}
            className={`flex items-center justify-between gap-2 rounded-card border px-4 py-3 text-left text-sm transition-colors disabled:opacity-60 ${
              selectedPromptId === p.id
                ? "border-brand-primary bg-brand-primary/10 text-text-strong"
                : "border-border-subtle bg-surface-subtle text-text-body hover:border-brand-primary/40"
            }`}
          >
            <span>{p.titulo}</span>
            {p.is_default && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-primary/20 px-2 py-0.5 text-xs font-semibold text-brand-primary">
                <Star className="h-3 w-3" aria-hidden="true" />
                Padrão
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled || prompts.length === 0}
          onClick={() => setCreatingFromTemplate(true)}
          className="flex items-center gap-2 rounded-card border border-dashed border-border-subtle px-4 py-3 text-left text-sm text-text-body hover:border-brand-primary/40 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          Criar novo a partir de um modelo
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
