"use client";

import { useState } from "react";
import { TenantSearchBox } from "@/components/admin/TenantSearchBox";
import { useTenantSearch } from "@/hooks/useTenantSearch";

interface FollowUpTenantPickerProps {
  defaultTenantId?: string;
  children: (tenantId: string, reset: () => void) => React.ReactNode;
}

export function FollowUpTenantPicker({ defaultTenantId, children }: FollowUpTenantPickerProps) {
  const [tenantId, setTenantId] = useState<string | null>(defaultTenantId || null);
  const { results, loading, error, notFound, search } = useTenantSearch();

  if (!tenantId) {
    return <TenantSearchBox results={results} loading={loading} error={error} notFound={notFound} onSearch={search} onSelect={setTenantId} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5">
        <p className="text-sm text-text-body">
          Tenant: <span className="font-semibold text-text-strong">{tenantId}</span>
        </p>
        <button
          type="button"
          onClick={() => setTenantId(null)}
          className="text-sm font-semibold text-brand-primary hover:underline"
        >
          Trocar tenant
        </button>
      </div>
      {children(tenantId, () => setTenantId(null))}
    </div>
  );
}
