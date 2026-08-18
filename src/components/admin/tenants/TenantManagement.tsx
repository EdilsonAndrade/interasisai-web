"use client";

import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { useTenantManagement } from "@/hooks/useTenantManagement";
import { TenantDeleteDialog } from "./TenantDeleteDialog";
import { TenantDetails } from "./TenantDetails";
import { TenantForm } from "./TenantForm";
import { TenantLookupForm } from "./TenantLookupForm";

type EditorMode = "create" | "edit" | null;

export function TenantManagement() {
  const management = useTenantManagement();
  const [editor, setEditor] = useState<EditorMode>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editing = editor === "edit" && management.tenant;

  const closeEditor = () => {
    if (management.isLoading) return;
    setEditor(null);
    management.clearFeedback();
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text-strong">Tenants</h1>
        <button
          type="button"
          onClick={() => { management.clearFeedback(); setEditor("create"); }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo tenant
        </button>
      </header>

      <section aria-labelledby="tenant-lookup-heading" className="space-y-6 rounded-card border border-brand-primary/20 bg-surface-base/60 p-5 backdrop-blur-xl sm:p-7">
        <h2 id="tenant-lookup-heading" className="text-lg font-bold text-text-strong">Consultar por ID</h2>
        <TenantLookupForm
          isLoading={management.operation === "lookup"}
          onLookup={management.lookup}
        />

        {management.error && !editor && !confirmDelete && (
          <p role="alert" className="flex items-start gap-2 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {management.error}
          </p>
        )}
        {management.tenant && (
          <TenantDetails
            tenant={management.tenant}
            onEdit={() => { management.clearFeedback(); setEditor("edit"); }}
            onDelete={() => { management.clearFeedback(); setConfirmDelete(true); }}
          />
        )}
      </section>

      <div aria-live="polite" aria-atomic="true">
        {management.feedback && (
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {management.feedback}
          </p>
        )}
      </div>

      <AdminDialog
        open={editor !== null}
        title={editor === "edit" ? "Editar tenant" : "Novo tenant"}
        onClose={closeEditor}
      >
        <TenantForm
          key={editor ?? "closed"}
          mode={editor === "edit" ? "edit" : "create"}
          initialValues={editing ? {
            tenant_id: editing.id,
            name: editing.name,
            google_calendar_id: editing.google_calendar_id,
            allowed_domains: editing.allowed_domains,
          } : undefined}
          isLoading={management.operation === "create" || management.operation === "update"}
          fieldErrors={management.fieldErrors}
          onCancel={closeEditor}
          onSubmit={async (input) => {
            const success = editor === "edit"
              ? await management.update(input)
              : await management.create(input);
            if (success) setEditor(null);
            return success;
          }}
        />
        {management.error && editor && <p role="alert" className="mt-4 text-sm text-red-300">{management.error}</p>}
      </AdminDialog>

      <TenantDeleteDialog
        open={confirmDelete}
        tenantName={management.tenant?.name ?? ""}
        isLoading={management.operation === "delete"}
        onCancel={() => { if (!management.isLoading) setConfirmDelete(false); }}
        onConfirm={async () => {
          if (await management.remove()) setConfirmDelete(false);
        }}
      />
    </main>
  );
}