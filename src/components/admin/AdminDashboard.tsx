"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { TenantSearchBox } from "@/components/admin/TenantSearchBox";
import { TenantContextCard } from "@/components/admin/TenantContextCard";
import { KnowledgeBaseEditor } from "@/components/admin/KnowledgeBaseEditor";
import { useTenantSearch } from "@/hooks/useTenantSearch";
import { useTenantContext } from "@/hooks/useTenantContext";

export function AdminDashboard() {
  const tenantSearch = useTenantSearch();
  const tenantContext = useTenantContext();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const handleSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    tenantContext.selectTenant(tenantId);
  };

  return (
    <section className="mx-auto w-full max-w-2xl space-y-8 px-4 py-16 sm:px-6" aria-live="polite">
      <Toaster richColors position="top-right" />

      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-text-strong sm:text-4xl">
          Buscar Tenant e Base de Conhecimento
        </h1>
        <p className="text-sm text-text-body">
          Busque um tenant para consultar seu contexto e gerenciar a base de conhecimento.
        </p>
      </header>

      <TenantSearchBox
        results={tenantSearch.results}
        loading={tenantSearch.loading}
        error={tenantSearch.error}
        notFound={tenantSearch.notFound}
        onSearch={tenantSearch.search}
        onSelect={handleSelect}
      />

      {selectedTenantId && (
        <>
          <TenantContextCard
            detail={tenantContext.detail}
            loading={tenantContext.loading}
            error={tenantContext.error}
          />
          <KnowledgeBaseEditor tenantId={selectedTenantId} />
        </>
      )}
    </section>
  );
}
