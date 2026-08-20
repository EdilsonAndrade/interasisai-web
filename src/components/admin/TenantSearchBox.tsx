"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { tenantSearchSchema, type TenantSearchInput } from "@/lib/tenantSchemas";
import type { TenantSearchItem } from "@/services/pythonBackend.types";

type TenantSearchBoxProps = {
  results: TenantSearchItem[];
  loading: boolean;
  error: string | null;
  notFound: boolean;
  onSearch: (term: string) => void;
  onSelect: (tenantId: string) => void;
};

export function TenantSearchBox({
  results,
  loading,
  error,
  notFound,
  onSearch,
  onSelect,
}: TenantSearchBoxProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantSearchInput>({
    resolver: zodResolver(tenantSearchSchema),
    defaultValues: { term: "" },
  });

  return (
    <div className="w-full max-w-2xl space-y-4 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8">
      <form onSubmit={handleSubmit(({ term }) => onSearch(term))} className="space-y-2">
        <label htmlFor="tenant-search-term" className="block text-sm font-medium text-text-body">
          Buscar tenant
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="tenant-search-term"
            type="text"
            disabled={loading}
            aria-invalid={Boolean(errors.term)}
            aria-describedby={errors.term ? "tenant-search-term-error" : undefined}
            placeholder="Nome ou ID do tenant"
            {...register("term")}
            className="min-w-0 flex-1 rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong placeholder:text-text-body/50 outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {errors.term && (
          <p id="tenant-search-term-error" role="alert" className="text-sm text-red-300">
            {errors.term.message}
          </p>
        )}
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      {!loading && notFound && (
        <p className="text-sm text-text-body/70">Nenhum tenant encontrado.</p>
      )}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((tenant) => (
            <li key={tenant.id}>
              <button
                type="button"
                onClick={() => onSelect(tenant.id)}
                className="flex w-full flex-col items-start gap-0.5 rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-left transition-colors hover:border-brand-primary/50 hover:bg-brand-primary/10"
              >
                <span className="text-sm font-semibold text-text-strong">{tenant.name}</span>
                <span className="text-xs text-text-body/70">ID: {tenant.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
