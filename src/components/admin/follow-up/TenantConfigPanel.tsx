"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useFollowUpTenantConfig } from "@/hooks/useFollowUpTenantConfig";
import { OfferForm } from "./OfferForm";

interface TenantConfigPanelProps {
  defaultTenantId?: string;
}

export function TenantConfigPanel({ defaultTenantId = "" }: TenantConfigPanelProps) {
  const [tenantIdInput, setTenantIdInput] = useState(defaultTenantId);
  const { config, loading, error, saving, fetchConfig, updateConfig } = useFollowUpTenantConfig();

  const handleSelectTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantIdInput.trim()) return;
    fetchConfig(tenantIdInput.trim());
  };

  return (
    <div>
      <form onSubmit={handleSelectTenant} className="rounded-card border border-border-subtle bg-surface-base/60 p-4 mb-4 backdrop-blur-xl">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="config-tenant-id" className="block text-sm font-medium text-text-body mb-1">
              Tenant ID
            </label>
            <input
              id="config-tenant-id"
              type="text"
              value={tenantIdInput}
              onChange={e => setTenantIdInput(e.target.value)}
              placeholder="e.g., acme"
              className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-sm text-text-strong outline-none focus:border-brand-primary"
            />
          </div>
          <button
            type="submit"
            disabled={!tenantIdInput.trim()}
            className="rounded-card bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selecionar
          </button>
        </div>
      </form>

      {!config && error && (
        <div className="mb-4 p-4 rounded-card bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 p-8 text-text-body">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Carregando configuração...</span>
        </div>
      )}

      {!loading && config && (
        <OfferForm config={config} saving={saving} error={error} onSave={updates => updateConfig(config.id, updates)} />
      )}
    </div>
  );
}
