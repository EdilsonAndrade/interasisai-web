"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  tenantCreateSchema,
  tenantDomainSchema,
  type TenantCreateInput,
} from "@/lib/tenantSchemas";
import { estimateRealMessages } from "@/lib/messageLimitEstimate";
import { missingRequiredPlaceholders } from "@/lib/promptPlaceholders";
import { PromptSelectField } from "@/components/admin/PromptSelectField";
import { MissingPlaceholdersAlert } from "@/components/admin/prompt-manager/MissingPlaceholdersAlert";
import { OnboardingPrerequisiteNotice } from "@/components/admin/onboarding/OnboardingPrerequisiteNotice";
import { EmailListEditor } from "@/components/admin/tenants/EmailListEditor";
import { useMessageLimitConfig } from "@/hooks/useMessageLimitConfig";
import type { TenantCreateBase, TenantCreateIntent } from "@/hooks/useTenantManagement";
import type { TenantFieldErrors, TenantWriteInput } from "@/services";
import type { Prompt, PromptCreateInput } from "@/services/promptManager.types";

// Satisfaz a validação Zod de "prompt escolhido" enquanto o rascunho do novo
// prompt vive em estado local — nunca é enviado ao backend como prompt_id.
const NEW_PROMPT_SENTINEL = "__new_prompt_draft__";
// Preenche o campo (nunca renderizado nem validado de fato) no modo edição,
// onde a troca de prompt não acontece por este formulário (FR-011).
const EDIT_MODE_PROMPT_PLACEHOLDER = "__edit_mode__";

type TenantFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<TenantCreateInput>;
  operationalPrompts?: Prompt[];
  isLoading: boolean;
  fieldErrors?: TenantFieldErrors;
  onCancel: () => void;
  onCreate?: (base: TenantCreateBase, intent: TenantCreateIntent) => Promise<boolean>;
  onEdit?: (input: TenantWriteInput) => Promise<boolean>;
  onDirtyChange?: (dirty: boolean) => void;
};

export function TenantForm({
  mode,
  initialValues,
  operationalPrompts = [],
  isLoading,
  fieldErrors,
  onCancel,
  onCreate,
  onEdit,
  onDirtyChange,
}: TenantFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<TenantCreateInput>({
    resolver: zodResolver(tenantCreateSchema),
    defaultValues: {
      tenant_id: initialValues?.tenant_id ?? "",
      name: initialValues?.name ?? "",
      google_calendar_id: initialValues?.google_calendar_id ?? "",
      allowed_domains: initialValues?.allowed_domains ?? [],
      scheduling_enabled: initialValues?.scheduling_enabled ?? true,
      prompt_id: mode === "edit" ? EDIT_MODE_PROMPT_PLACEHOLDER : "",
      monthly_message_limit: initialValues?.monthly_message_limit ?? null,
      notification_emails: initialValues?.notification_emails ?? [],
    },
  });
  const allowedDomains = useWatch({ control, name: "allowed_domains" }) ?? [];
  const notificationEmails = useWatch({ control, name: "notification_emails" }) ?? [];
  const monthlyMessageLimit = useWatch({ control, name: "monthly_message_limit" });
  const promptId = useWatch({ control, name: "prompt_id" });
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState<string>();
  const [newPromptDraft, setNewPromptDraft] = useState<PromptCreateInput | null>(null);
  const [missingTokens, setMissingTokens] = useState<string[] | null>(null);
  const [pendingCreateValues, setPendingCreateValues] = useState<TenantCreateInput | null>(null);
  const { config: messageLimitConfig } = useMessageLimitConfig();
  const messageLimitEstimate =
    typeof monthlyMessageLimit === "number"
      ? estimateRealMessages(monthlyMessageLimit, messageLimitConfig.worst_case_calls_per_message)
      : null;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (fieldErrors?.name) setError("name", { message: fieldErrors.name });
    if (fieldErrors?.tenant_id) {
      setError("tenant_id", { message: fieldErrors.tenant_id });
    }
    if (fieldErrors?.google_calendar_id) {
      setError("google_calendar_id", { message: fieldErrors.google_calendar_id });
    }
    if (fieldErrors?.allowed_domains) {
      setError("allowed_domains", { message: fieldErrors.allowed_domains });
    }
    if (fieldErrors?.prompt_id) {
      setError("prompt_id", { message: fieldErrors.prompt_id });
    }
    if (fieldErrors?.monthly_message_limit) {
      setError("monthly_message_limit", { message: fieldErrors.monthly_message_limit });
    }
    if (fieldErrors?.notification_emails) {
      setError("notification_emails", { message: fieldErrors.notification_emails });
    }
  }, [fieldErrors, setError]);

  const selectExistingPrompt = (id: string) => {
    setNewPromptDraft(null);
    setValue("prompt_id", id, { shouldValidate: true });
  };

  const changeNewPromptDraft = (draft: PromptCreateInput | null) => {
    setNewPromptDraft(draft);
    setMissingTokens(null);
    setPendingCreateValues(null);
    setValue("prompt_id", draft ? NEW_PROMPT_SENTINEL : "", { shouldValidate: true });
  };

  const submitCreate = async (values: TenantCreateInput) => {
    const base: TenantCreateBase = {
      tenant_id: values.tenant_id,
      name: values.name,
      google_calendar_id: values.google_calendar_id,
      allowed_domains: values.allowed_domains,
      scheduling_enabled: values.scheduling_enabled,
      monthly_message_limit: values.monthly_message_limit,
      notification_emails: values.notification_emails,
    };
    const intent: TenantCreateIntent = newPromptDraft
      ? { mode: "new", prompt: newPromptDraft }
      : { mode: "existing", prompt_id: values.prompt_id };

    const ok = await onCreate?.(base, intent);
    if (ok) {
      reset();
      setNewPromptDraft(null);
    }
  };

  const submit = async (values: TenantCreateInput) => {
    if (mode === "edit") {
      const ok = await onEdit?.({
        name: values.name,
        google_calendar_id: values.google_calendar_id,
        allowed_domains: values.allowed_domains,
        scheduling_enabled: values.scheduling_enabled,
        monthly_message_limit: values.monthly_message_limit,
        notification_emails: values.notification_emails,
      });
      if (ok) reset();
      return;
    }

    if (newPromptDraft) {
      const missing = missingRequiredPlaceholders(newPromptDraft.conteudo, newPromptDraft.node_type);
      if (missing.length > 0) {
        setMissingTokens(missing);
        setPendingCreateValues(values);
        return;
      }
    }
    await submitCreate(values);
  };

  const handleFixMissingPlaceholders = () => {
    setMissingTokens(null);
    setPendingCreateValues(null);
  };

  const handleSaveAnyway = async () => {
    setMissingTokens(null);
    if (pendingCreateValues) {
      await submitCreate(pendingCreateValues);
      setPendingCreateValues(null);
    }
  };

  const addDomain = () => {
    if (!domainInput.trim()) return;
    const parsed = tenantDomainSchema.safeParse(domainInput.trim());
    if (!parsed.success) {
      setDomainError(parsed.error.issues[0]?.message ?? "Informe um domínio válido.");
      return;
    }
    const nextDomains = Array.from(new Set([...allowedDomains, parsed.data]));
    setValue("allowed_domains", nextDomains, { shouldValidate: true });
    setDomainInput("");
    setDomainError(undefined);
  };
  const removeDomain = (domain: string) => {
    setValue(
      "allowed_domains",
      allowedDomains.filter((item) => item !== domain),
      { shouldValidate: true },
    );
  };
  const handleDomainKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addDomain();
  };
  const actionLabel = mode === "create" ? "Cadastrar tenant" : "Salvar alterações";
  const loadingLabel = mode === "create" ? "Cadastrando" : "Salvando";

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      {missingTokens && missingTokens.length > 0 && (
        <MissingPlaceholdersAlert
          missingTokens={missingTokens}
          onFix={handleFixMissingPlaceholders}
          onSaveAnyway={handleSaveAnyway}
        />
      )}
      {mode === "create" && (
        <div className="space-y-2">
          <label htmlFor="tenant-create-id" className="text-sm font-medium text-text-body">ID do tenant</label>
          <input
            id="tenant-create-id"
            autoFocus
            disabled={isLoading}
            aria-invalid={Boolean(errors.tenant_id)}
            aria-describedby={errors.tenant_id ? "tenant-create-id-error" : undefined}
            {...register("tenant_id")}
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
          />
          {errors.tenant_id && <p id="tenant-create-id-error" role="alert" className="text-sm text-red-300">{errors.tenant_id.message}</p>}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="tenant-name" className="text-sm font-medium text-text-body">Nome do tenant</label>
        <input
          id="tenant-name"
          autoFocus={mode === "edit"}
          disabled={isLoading}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "tenant-name-error" : undefined}
          {...register("name")}
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
        />
        {errors.name && <p id="tenant-name-error" role="alert" className="text-sm text-red-300">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="tenant-calendar" className="text-sm font-medium text-text-body">ID do Google Calendar</label>
        <input
          id="tenant-calendar"
          disabled={isLoading}
          aria-invalid={Boolean(errors.google_calendar_id)}
          aria-describedby={errors.google_calendar_id ? "tenant-calendar-error" : undefined}
          {...register("google_calendar_id")}
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
        />
        {errors.google_calendar_id && <p id="tenant-calendar-error" role="alert" className="text-sm text-red-300">{errors.google_calendar_id.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="tenant-domain-input" className="text-sm font-medium text-text-body">Domínios permitidos</label>
        <input
          id="tenant-domain-input"
          value={domainInput}
          disabled={isLoading}
          onChange={(event) => { setDomainInput(event.target.value); setDomainError(undefined); }}
          onKeyDown={handleDomainKeyDown}
          onBlur={addDomain}
          placeholder="exemplo.com.br"
          aria-invalid={Boolean(domainError || errors.allowed_domains)}
          aria-describedby={domainError || errors.allowed_domains ? "tenant-domains-error" : undefined}
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
        />
        <input type="hidden" {...register("allowed_domains")} />
        {allowedDomains.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Domínios permitidos adicionados">
            {allowedDomains.map((domain) => (
              <li key={domain} className="inline-flex max-w-full items-center gap-2 rounded-card border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm text-text-strong">
                <span className="break-all">{domain}</span>
                <button
                  type="button"
                  onClick={() => removeDomain(domain)}
                  disabled={isLoading}
                  aria-label={`Remover domínio ${domain}`}
                  className="shrink-0 rounded-full p-0.5 text-text-muted hover:bg-surface-subtle hover:text-text-strong disabled:opacity-60"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {(domainError || errors.allowed_domains) && (
          <p id="tenant-domains-error" role="alert" className="text-sm text-red-300">
            {domainError ?? errors.allowed_domains?.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            disabled={isLoading}
            {...register("scheduling_enabled")}
            className="h-4 w-4 rounded accent-brand-primary"
          />
          <span className="text-sm text-text-body">
            Agendamento habilitado{" "}
            <span className="text-text-weak">(disponibiliza as ferramentas de calendário para o agente)</span>
          </span>
        </label>
      </div>
      <div className="space-y-2">
        <label htmlFor="tenant-monthly-limit" className="text-sm font-medium text-text-body">
          Limite mensal de chamadas de LLM (opcional)
        </label>
        <input
          id="tenant-monthly-limit"
          type="number"
          min={1}
          step={1}
          disabled={isLoading}
          aria-invalid={Boolean(errors.monthly_message_limit)}
          aria-describedby={errors.monthly_message_limit ? "tenant-monthly-limit-error" : undefined}
          {...register("monthly_message_limit", {
            setValueAs: (value) => (value === "" || value === null ? null : Number(value)),
          })}
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
        />
        <p className="text-xs text-text-weak">
          Contado por chamada de LLM, não por mensagem real do cliente final.
          {messageLimitEstimate !== null && (
            <> Estimativa: ≈ {messageLimitEstimate} mensagens reais no pior caso.</>
          )}
        </p>
        {errors.monthly_message_limit && (
          <p id="tenant-monthly-limit-error" role="alert" className="text-sm text-red-300">
            {errors.monthly_message_limit.message}
          </p>
        )}
      </div>
      <EmailListEditor
        id="tenant-notification-emails"
        label="E-mails de aviso de consumo (opcional)"
        value={notificationEmails}
        onChange={(emails) => setValue("notification_emails", emails, { shouldValidate: true, shouldDirty: true })}
        disabled={isLoading}
        error={errors.notification_emails?.message}
      />
      {mode === "create" && (
        <PromptSelectField
          prompts={operationalPrompts}
          selectedPromptId={promptId === NEW_PROMPT_SENTINEL ? "" : promptId}
          newPromptDraft={newPromptDraft}
          onSelectExisting={selectExistingPrompt}
          onNewPromptDraftChange={changeNewPromptDraft}
          disabled={isLoading}
          error={errors.prompt_id?.message}
        />
      )}
      {mode === "create" && <OnboardingPrerequisiteNotice />}
      <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" disabled={isLoading} onClick={onCancel} className="rounded-card border border-border-subtle px-4 py-3 text-sm font-semibold text-text-body hover:bg-surface-subtle disabled:opacity-60">Cancelar</button>
        <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse disabled:opacity-60">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isLoading ? loadingLabel : actionLabel}
        </button>
      </footer>
    </form>
  );
}
