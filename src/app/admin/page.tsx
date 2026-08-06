"use client";

import { IngestForm } from "@/components/admin/IngestForm";
import { useAdminIngest } from "@/hooks/useAdminIngest";

// Note: Metadata in client components is not directly supported by Next.js App Router.
// For a production setup, this should be a separate layout.tsx with metadata export.
// The page title will be set via document.title as a client-side fallback.

export default function AdminPage() {
  const {
    tenantId,
    textContent,
    isLoading,
    result,
    setTenantId,
    setTextContent,
    submitIngest,
    clearResult,
  } = useAdminIngest();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-16 sm:px-6 lg:px-8">
      <section className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-text-strong sm:text-4xl">
            Painel Administrador
          </h1>
          <p className="text-sm text-text-body">
            Envie regras de negócio e textos institucionais para vetorização na
            base de conhecimento (RAG) da IA.
          </p>
        </div>

        {/* Form */}
        <IngestForm
          tenantId={tenantId}
          textContent={textContent}
          isLoading={isLoading}
          result={result}
          onTenantIdChange={setTenantId}
          onTextContentChange={setTextContent}
          onSubmit={submitIngest}
          onClearResult={clearResult}
        />
      </section>
    </main>
  );
}
