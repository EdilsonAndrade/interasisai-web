"use client";

import { IngestForm } from "@/components/admin/IngestForm";
import { useAdminIngest } from "@/hooks/useAdminIngest";

export function AdminDashboard() {
  const ingest = useAdminIngest();

  return (
    <section className="mx-auto w-full max-w-2xl space-y-8 px-4 py-16 sm:px-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-text-strong sm:text-4xl">
          Painel Administrador - Adicionar Novo Tenant
        </h1>
        <p className="text-sm text-text-body">
          Gerencie a base de conhecimento e os canais de atendimento.
        </p>
      </header>

      <IngestForm
        tenantId={ingest.tenantId}
        textContent={ingest.textContent}
        isLoading={ingest.isLoading}
        result={ingest.result}
        onTenantIdChange={ingest.setTenantId}
        onTextContentChange={ingest.setTextContent}
        onSubmit={ingest.submitIngest}
        onClearResult={ingest.clearResult}
      />
    </section>
  );
}