// ============================================================================
// PromptFormModal — Modal de criação/edição de prompt com seletor N:N de guardrails
// ============================================================================

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { promptFormSchema, type PromptFormData } from "@/lib/promptManagerSchemas";
import { MarkdownEditorCustom } from "./MarkdownEditorCustom";
import type { Guardrail, NodeType, Prompt } from "@/services/promptManager.types";

const NODE_OPTIONS: { id: NodeType; label: string }[] = [
  { id: "operational", label: "Operacional" },
  { id: "institutional", label: "Institucional" },
  { id: "chitchat", label: "Chitchat" },
];

interface PromptFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Prompt | null;
  availableGuardrails: Guardrail[];
  onClose: () => void;
  onSubmit: (data: PromptFormData) => Promise<boolean>;
}

export function PromptFormModal({
  open,
  mode,
  initial,
  availableGuardrails,
  onClose,
  onSubmit,
}: PromptFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      titulo: "",
      conteudo: "",
      is_default: false,
      node_type: "operational",
      guardrail_ids: [],
    },
  });

  const conteudoValue = watch("conteudo");
  const selectedIds = watch("guardrail_ids");

  // Pre-fill form when editing
  useEffect(() => {
    if (open && mode === "edit" && initial) {
      const selectedGuardrailIds =
        initial.guardrail_ids?.length
          ? initial.guardrail_ids
          : (initial.guardrails ?? []).map((g) => g.id);

      reset({
        titulo: initial.titulo,
        conteudo: initial.conteudo,
        is_default: initial.is_default,
        node_type: initial.node_type ?? "operational",
        guardrail_ids: selectedGuardrailIds,
      });
    } else if (open && mode === "create") {
      reset({
        titulo: "",
        conteudo: "",
        is_default: false,
        node_type: "operational",
        guardrail_ids: [],
      });
    }
  }, [open, mode, initial, reset]);

  const onFormSubmit = async (data: PromptFormData) => {
    const ok = await onSubmit(data);
    if (ok) {
      onClose();
    }
  };

  const toggleGuardrail = (id: string) => {
    const current = selectedIds ?? [];
    const next = current.includes(id)
      ? current.filter((gid) => gid !== id)
      : [...current, id];
    setValue("guardrail_ids", next, { shouldValidate: true });
  };

  const title = mode === "create" ? "Novo Prompt" : "Editar Prompt";

  return (
    <AdminDialog
      open={open}
      title={title}
      onClose={onClose}
      className="md:w-[60vw] md:max-w-[60vw]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prompt-titulo" className="text-sm font-semibold text-text-strong">
            Título
          </label>
          <input
            id="prompt-titulo"
            type="text"
            autoFocus
            {...register("titulo")}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-body outline-none transition-colors focus:border-brand-primary disabled:opacity-60"
            placeholder="Ex: Atendimento Inicial"
          />
          {errors.titulo && (
            <p role="alert" className="text-xs font-semibold text-red-400">
              {errors.titulo.message}
            </p>
          )}
        </div>

        {/* Conteúdo (Markdown Editor) */}
        <div className="flex flex-col gap-1.5">
          <MarkdownEditorCustom
            value={conteudoValue}
            onChange={(v) => setValue("conteudo", v, { shouldValidate: true })}
            label="Conteúdo (Markdown)"
          />
          {errors.conteudo && (
            <p role="alert" className="text-xs font-semibold text-red-400">
              {errors.conteudo.message}
            </p>
          )}
        </div>

        {/* Toggle is_default */}
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register("is_default")}
            className="h-4 w-4 rounded accent-brand-primary"
          />
          <span className="text-sm text-text-body">
            Padrão <span className="text-text-weak">(prompt padrão do sistema)</span>
          </span>
        </label>

        {/* Nó de Destino */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prompt-node-type" className="text-sm font-semibold text-text-strong">
            Nó de Destino
          </label>
          <select
            id="prompt-node-type"
            {...register("node_type")}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-body outline-none transition-colors focus:border-brand-primary disabled:opacity-60"
          >
            {NODE_OPTIONS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          {errors.node_type && (
            <p role="alert" className="text-xs font-semibold text-red-400">
              {errors.node_type.message}
            </p>
          )}
        </div>

        {/* Guardrails N:N Selector */}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-text-strong">
            Guardrails Vinculados
          </legend>
          {availableGuardrails.length === 0 ? (
            <p className="text-sm text-text-weak italic">
              Nenhum guardrail disponível. Cadastre guardrails primeiro.
            </p>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-card border border-border-subtle bg-surface-base p-3">
              {availableGuardrails.map((g) => (
                <label
                  key={g.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-subtle"
                >
                  <input
                    type="checkbox"
                    checked={(selectedIds ?? []).includes(g.id)}
                    onChange={() => toggleGuardrail(g.id)}
                    className="mt-0.5 h-4 w-4 rounded accent-brand-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-text-body">{g.titulo}</span>
                    {g.is_global && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-brand-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                        Global
                      </span>
                    )}
                    <p className="mt-0.5 line-clamp-1 text-xs text-text-weak">
                      {g.conteudo.slice(0, 80)}
                      {g.conteudo.length > 80 ? "…" : ""}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
          {errors.guardrail_ids && (
            <p role="alert" className="text-xs font-semibold text-red-400">
              {errors.guardrail_ids.message}
            </p>
          )}
        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex min-h-10 items-center rounded-card border border-border-subtle px-4 py-2 text-sm font-semibold text-text-body transition-colors hover:bg-surface-subtle disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-10 items-center gap-2 rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar Prompt" : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
