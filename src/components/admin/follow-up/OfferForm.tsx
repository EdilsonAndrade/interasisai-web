"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { FollowUpTenantConfig } from "@/services/followUpApi.types";
import { UpdateFollowUpTenantConfigSchema } from "@/lib/followUpSchemas";

interface OfferFormProps {
  config: FollowUpTenantConfig;
  saving: boolean;
  error: string | null;
  onSave: (updates: Partial<FollowUpTenantConfig>) => Promise<void>;
}

const RETENTION_PRESETS = [30, 60, 90, 120, 180, 365];

const inputClass =
  "w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-sm text-text-strong outline-none focus:border-brand-primary";

export function OfferForm({ config, saving, error, onSave }: OfferFormProps) {
  const [ofertaTexto, setOfertaTexto] = useState("");
  const [ofertaValidade, setOfertaValidade] = useState("");
  const [retentionDays, setRetentionDays] = useState(90);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    setOfertaTexto(config.oferta_vigente_texto || "");
    setOfertaValidade(config.oferta_vigente_validade ? config.oferta_vigente_validade.slice(0, 10) : "");
    setRetentionDays(config.retention_days ?? 90);
    setAttempted(false);
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setAttempted(false);

    const payload = {
      oferta_vigente_texto: ofertaTexto.trim() ? ofertaTexto.trim() : null,
      oferta_vigente_validade: ofertaValidade ? new Date(`${ofertaValidade}T23:59:59Z`).toISOString() : null,
      retention_days: retentionDays,
    };

    const validation = UpdateFollowUpTenantConfigSchema.safeParse(payload);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    await onSave(payload);
    setAttempted(true);
  };

  const success = attempted && !saving && !error;

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-card border border-border-subtle bg-surface-base/60 p-6 space-y-5 backdrop-blur-xl">
      <div>
        <label htmlFor="oferta-texto" className="block text-sm font-medium text-text-body mb-1">
          Oferta Vigente
        </label>
        <textarea
          id="oferta-texto"
          value={ofertaTexto}
          onChange={e => setOfertaTexto(e.target.value)}
          placeholder="e.g., Desconto de 10% + frete grátis"
          className={`${inputClass} h-24`}
        />
        {fieldErrors.oferta_vigente_texto && <p className="text-sm text-red-300 mt-1">{fieldErrors.oferta_vigente_texto}</p>}
      </div>

      <div>
        <label htmlFor="oferta-validade" className="block text-sm font-medium text-text-body mb-1">
          Validade da Oferta
        </label>
        <input
          id="oferta-validade"
          type="date"
          value={ofertaValidade}
          onChange={e => setOfertaValidade(e.target.value)}
          className={inputClass}
        />
        {fieldErrors.oferta_vigente_validade && <p className="text-sm text-red-300 mt-1">{fieldErrors.oferta_vigente_validade}</p>}
      </div>

      <div>
        <label htmlFor="retention-days" className="block text-sm font-medium text-text-body mb-1">
          Retenção do Histórico (dias)
        </label>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            id="retention-days"
            type="number"
            min={1}
            value={retentionDays}
            onChange={e => setRetentionDays(Number(e.target.value))}
            className={`${inputClass} w-32`}
          />
          <select
            value={RETENTION_PRESETS.includes(retentionDays) ? retentionDays : ""}
            onChange={e => e.target.value && setRetentionDays(Number(e.target.value))}
            className={inputClass + " w-auto"}
          >
            <option value="">Presets...</option>
            {RETENTION_PRESETS.map(preset => (
              <option key={preset} value={preset}>
                {preset} dias
              </option>
            ))}
          </select>
        </div>
        {fieldErrors.retention_days && <p className="text-sm text-red-300 mt-1">{fieldErrors.retention_days}</p>}
      </div>

      {error && (
        <div className="rounded-card bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-card bg-green-500/10 border border-green-500/30 p-3">
          <p className="text-sm text-green-300">Configuração salva com sucesso</p>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-card bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {saving ? "Salvando..." : "Salvar Configuração"}
      </button>
    </form>
  );
}
