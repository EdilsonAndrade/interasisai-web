"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { tenantLookupSchema, type TenantLookupInput } from "@/lib/tenantSchemas";

type TenantLookupFormProps = {
  isLoading: boolean;
  onLookup: (tenantId: string) => Promise<boolean>;
};

export function TenantLookupForm({ isLoading, onLookup }: TenantLookupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantLookupInput>({
    resolver: zodResolver(tenantLookupSchema),
    defaultValues: { tenantId: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(({ tenantId }) => onLookup(tenantId))}
      className="space-y-2"
    >
      <label htmlFor="tenant-id" className="text-sm font-medium text-text-body">ID do tenant</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="tenant-id"
          disabled={isLoading}
          aria-invalid={Boolean(errors.tenantId)}
          aria-describedby={errors.tenantId ? "tenant-id-error" : undefined}
          {...register("tenantId")}
          className="min-w-0 flex-1 rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary disabled:opacity-60"
        />
        <button type="submit" disabled={isLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-card border border-brand-primary/40 px-4 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10 disabled:opacity-60">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
          {isLoading ? "Buscando" : "Buscar tenant"}
        </button>
      </div>
      {errors.tenantId && <p id="tenant-id-error" role="alert" className="text-sm text-red-300">{errors.tenantId.message}</p>}
    </form>
  );
}