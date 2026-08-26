"use client";

import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { useOnboardingGuideContext } from "@/context/OnboardingGuideContext";
import { useTenantManagement } from "@/hooks/useTenantManagement";
import { usePrompts } from "@/hooks/usePrompts";
import { useTenantPromptBinding } from "@/hooks/useTenantPromptBinding";
import { useTenantDeleteImpact } from "@/hooks/useTenantDeleteImpact";
import { useTenantNodePrompts } from "@/hooks/useTenantNodePrompts";
import { useTenantGrid } from "@/hooks/useTenantGrid";
import { TenantDeleteDialog } from "./TenantDeleteDialog";
import { TenantDetails } from "./TenantDetails";
import { TenantForm } from "./TenantForm";
import { TenantGrid } from "./TenantGrid";
import { TenantLookupForm } from "./TenantLookupForm";

type EditorMode = "create" | "edit" | null;

export function TenantManagement() {
  const management = useTenantManagement();
  const guide = useOnboardingGuideContext();
  const promptsHook = usePrompts();
  const binding = useTenantPromptBinding();
  const deleteImpact = useTenantDeleteImpact();
  const nodePrompts = useTenantNodePrompts();
  const grid = useTenantGrid();
  const operationalPrompts = promptsHook.prompts.filter((p) => p.node_type === "operational");
  const [editor, setEditor] = useState<EditorMode>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [formDirty, setFormDirty] = useState(false);

  const closeDeleteDialog = () => {
    if (management.isLoading) return;
    setConfirmDelete(false);
    setDeleteConfirmText("");
    deleteImpact.clear();
  };
  const editing = editor === "edit" && management.tenant;

  useEffect(() => {
    grid.fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Um prompt novo pode ter sido criado no passo 1 do cadastro composto
    // mesmo que o passo 2 (criar o tenant) tenha falhado — atualiza a lista
    // para que ele apareça disponível para a nova tentativa (FR-010).
    if (management.pendingPromptId) {
      promptsHook.refreshPrompts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [management.pendingPromptId]);

  useEffect(() => {
    if (management.tenant) {
      binding.fetchBinding(management.tenant.id);
      nodePrompts.fetchAll(management.tenant.id);
    } else {
      binding.clear();
      nodePrompts.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [management.tenant?.id]);

  const closeEditor = () => {
    if (management.isLoading) return;
    setEditor(null);
    setFormDirty(false);
    management.clearFeedback();
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text-strong">Tenants</h1>
        <div className="flex items-center gap-4">
          {!guide.isEnabled && (
            <button
              type="button"
              onClick={guide.reEnableGuide}
              className="text-xs font-semibold text-text-weak underline-offset-2 hover:text-text-body hover:underline"
            >
              Reativar guia de configuração
            </button>
          )}
          <button
            type="button"
            onClick={() => { management.clearFeedback(); setFormDirty(false); setEditor("create"); }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo tenant
          </button>
        </div>
      </header>

      <TenantGrid
        items={grid.items}
        total={grid.total}
        offset={grid.offset}
        limit={grid.limit}
        loading={grid.loading}
        error={grid.error}
        hasPrevious={grid.hasPrevious}
        hasNext={grid.hasNext}
        onSelect={(tenantId) => { management.clearFeedback(); management.lookup(tenantId); }}
        onPrevious={grid.goToPrevious}
        onNext={grid.goToNext}
      />

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
            onEdit={() => { management.clearFeedback(); setFormDirty(false); setEditor("edit"); }}
            onDelete={() => {
              management.clearFeedback();
              setDeleteConfirmText("");
              setConfirmDelete(true);
              deleteImpact.fetchImpact(management.tenant!.id);
            }}
            bindingState={binding.state}
            bindingDetail={binding.detail}
            bindingError={binding.error}
            bindingLinking={binding.linking}
            operationalPrompts={operationalPrompts}
            onLinkPrompt={(promptId) => binding.linkPrompt(management.tenant!.id, promptId)}
            institutionalPrompt={nodePrompts.entries.institutional}
            chitchatPrompt={nodePrompts.entries.chitchat}
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
        hasUnsavedChanges={formDirty}
        closeDisabled={management.isLoading}
      >
        <TenantForm
          key={editor ?? "closed"}
          mode={editor === "edit" ? "edit" : "create"}
          initialValues={editing ? {
            tenant_id: editing.id,
            name: editing.name,
            google_calendar_id: editing.google_calendar_id,
            allowed_domains: editing.allowed_domains,
            scheduling_enabled: editing.scheduling_enabled,
            monthly_message_limit: editing.monthly_message_limit ?? null,
            notification_emails: editing.notification_emails ?? [],
          } : undefined}
          operationalPrompts={operationalPrompts}
          isLoading={management.operation === "create" || management.operation === "update"}
          fieldErrors={management.fieldErrors}
          onCancel={closeEditor}
          onDirtyChange={setFormDirty}
          onEdit={async (input) => {
            const success = await management.update(input);
            if (success) {
              setEditor(null);
              grid.fetchPage(grid.offset);
            }
            return success;
          }}
          onCreate={async (base, intent) => {
            const success = await management.create(base, intent);
            if (success) {
              setEditor(null);
              if (intent.mode === "new") promptsHook.refreshPrompts();
              grid.fetchPage(grid.offset);
              guide.openGuide(base.tenant_id);
            }
            return success;
          }}
        />
        {management.error && editor && <p role="alert" className="mt-4 text-sm text-red-300">{management.error}</p>}
      </AdminDialog>

      <TenantDeleteDialog
        open={confirmDelete}
        tenantName={management.tenant?.name ?? ""}
        isLoading={management.operation === "delete"}
        impactState={deleteImpact.state}
        impact={deleteImpact.impact}
        impactError={deleteImpact.error}
        deleteError={confirmDelete ? management.error : null}
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        onRetryImpact={() => { if (management.tenant) deleteImpact.fetchImpact(management.tenant.id); }}
        onCancel={closeDeleteDialog}
        onConfirm={async () => {
          if (await management.remove()) {
            closeDeleteDialog();
            grid.fetchPage(grid.offset);
          }
        }}
      />
    </main>
  );
}