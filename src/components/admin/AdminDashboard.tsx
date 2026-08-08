"use client";

import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import { IngestForm } from "@/components/admin/IngestForm";
import { useAdminIngest } from "@/hooks/useAdminIngest";

export function AdminDashboard() {
  const ingest = useAdminIngest();

  return (
    <section className="mx-auto w-full max-w-2xl space-y-8 px-4 py-16 sm:px-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-text-strong sm:text-4xl">
          Painel Administrador
        </h1>
        <p className="text-sm text-text-body">
          Gerencie a base de conhecimento e os canais de atendimento.
        </p>
        <Link
          href="/admin/whatsapp"
          className="inline-flex items-center gap-2 rounded-card border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10"
        >
          <MessageCircleMore className="h-4 w-4" aria-hidden="true" />
          Instâncias WhatsApp
        </Link>
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