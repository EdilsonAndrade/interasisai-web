"use client";

import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type IngestFormProps = {
  tenantId: string;
  textContent: string;
  isLoading: boolean;
  result: { type: "success" | "error"; message: string } | null;
  onTenantIdChange: (value: string) => void;
  onTextContentChange: (value: string) => void;
  onSubmit: () => void;
  onClearResult: () => void;
};

export function IngestForm({
  tenantId,
  textContent,
  isLoading,
  result,
  onTenantIdChange,
  onTextContentChange,
  onSubmit,
  onClearResult,
}: IngestFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl space-y-6 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8"
    >
      {/* Tenant ID field */}
      <div className="space-y-2">
        <label
          htmlFor="tenant-id"
          className="block text-sm font-medium text-text-body"
        >
          Tenant ID
        </label>
        <input
          id="tenant-id"
          type="text"
          value={tenantId}
          onChange={(e) => {
            onTenantIdChange(e.target.value);
            if (result) onClearResult();
          }}
          placeholder="Ex: 987654"
          disabled={isLoading}
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-text-strong placeholder:text-text-body/50 focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Text content field */}
      <div className="space-y-2">
        <label
          htmlFor="text-content"
          className="block text-sm font-medium text-text-body"
        >
          Regras de Negócio / Texto Institucional
        </label>
        <textarea
          id="text-content"
          value={textContent}
          onChange={(e) => {
            onTextContentChange(e.target.value);
            if (result) onClearResult();
          }}
          placeholder="Cole aqui o texto institucional do cliente, regras de negócio, horários de funcionamento, preços, etc..."
          rows={10}
          maxLength={100_000}
          disabled={isLoading}
          className="w-full resize-y rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong placeholder:text-text-body/50 focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-right text-xs text-text-body/60">
          {textContent.length.toLocaleString()} / 100.000 caracteres
        </p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-card bg-brand-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando para vetorização...
          </>
        ) : (
          "Salvar e Vetorizar Base de Conhecimento"
        )}
      </button>

      {/* Result feedback */}
      {result && (
        <div
          className={`flex items-start gap-3 rounded-card border p-4 ${
            result.type === "success"
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
          role="alert"
        >
          {result.type === "success" ? (
            <CheckCircle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
              aria-hidden="true"
            />
          )}
          <p
            className={`text-sm ${
              result.type === "success" ? "text-green-300" : "text-red-300"
            }`}
          >
            {result.message}
          </p>
        </div>
      )}
    </form>
  );
}
