"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  tenantCreateSchema,
  type TenantCreateInput,
} from "@/lib/tenantSchemas";
import type { TenantFieldErrors } from "@/services";

type TenantFormProps = {
  mode: "create" | "edit";
  initialValues?: TenantCreateInput;
  isLoading: boolean;
  fieldErrors?: TenantFieldErrors;
  onCancel: () => void;
  onSubmit: (input: TenantCreateInput) => Promise<boolean>;
};

export function TenantForm({
  mode,
  initialValues,
  isLoading,
  fieldErrors,
  onCancel,
  onSubmit,
}: TenantFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<TenantCreateInput>({
    resolver: zodResolver(tenantCreateSchema),
    defaultValues: initialValues ?? {
      tenant_id: "",
      name: "",
      google_calendar_id: "",
    },
  });

  useEffect(() => {
    if (fieldErrors?.name) setError("name", { message: fieldErrors.name });
    if (fieldErrors?.tenant_id) {
      setError("tenant_id", { message: fieldErrors.tenant_id });
    }
    if (fieldErrors?.google_calendar_id) {
      setError("google_calendar_id", { message: fieldErrors.google_calendar_id });
    }
  }, [fieldErrors, setError]);

  const submit = async (input: TenantCreateInput) => {
    if (await onSubmit(input)) reset();
  };
  const actionLabel = mode === "create" ? "Cadastrar tenant" : "Salvar alterações";
  const loadingLabel = mode === "create" ? "Cadastrando" : "Salvando";

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
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