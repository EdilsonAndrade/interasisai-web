// ============================================================================
// GuardrailFormModal — Modal de criação/edição de guardrail
// ============================================================================

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { guardrailFormSchema, type GuardrailFormData } from "@/lib/promptManagerSchemas";
import { MarkdownEditorCustom } from "./MarkdownEditorCustom";
import type { Guardrail } from "@/services/promptManager.types";

interface GuardrailFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Guardrail | null;
  onClose: () => void;
  onSubmit: (data: GuardrailFormData) => Promise<boolean>;
}

export function GuardrailFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: GuardrailFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<GuardrailFormData>({
    resolver: zodResolver(guardrailFormSchema),
    defaultValues: { titulo: "", conteudo: "", is_global: false },
  });

  const conteudoValue = watch("conteudo");

  // Pre-fill form when editing
  useEffect(() => {
    if (open && mode === "edit" && initial) {
      reset({
        titulo: initial.titulo,
        conteudo: initial.conteudo,
        is_global: initial.is_global,
      });
    } else if (open && mode === "create") {
      reset({ titulo: "", conteudo: "", is_global: false });
    }
  }, [open, mode, initial, reset]);

  const onFormSubmit = async (data: GuardrailFormData) => {
    const ok = await onSubmit(data);
    if (ok) {
      onClose();
    }
  };

  const title = mode === "create" ? "Novo Guardrail" : "Editar Guardrail";

  return (
    <AdminDialog
      open={open}
      title={title}
      onClose={onClose}
      hasUnsavedChanges={isDirty}
      closeDisabled={isSubmitting}
      className="md:w-[60vw] md:max-w-[60vw]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="guardrail-titulo" className="text-sm font-semibold text-text-strong">
            Título
          </label>
          <input
            id="guardrail-titulo"
            type="text"
            autoFocus
            {...register("titulo")}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-body outline-none transition-colors focus:border-brand-primary disabled:opacity-60"
            placeholder="Ex: Proibido falar sobre política"
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

        {/* Toggle is_global */}
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register("is_global")}
            className="h-4 w-4 rounded accent-brand-primary"
          />
          <span className="text-sm text-text-body">
            Global <span className="text-text-weak">(aplica-se a todos os prompts)</span>
          </span>
        </label>

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
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar Guardrail" : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
