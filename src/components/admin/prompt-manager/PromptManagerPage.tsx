// ============================================================================
// PromptManagerPage — Client orchestrator: 3 tabs + shared state
// ============================================================================

"use client";

import { useState } from "react";
import { Link, MessageSquare, Shield } from "lucide-react";
import { Toaster } from "sonner";
import { Tabs } from "./Tabs";
import { GuardrailList } from "./GuardrailList";
import { GuardrailFormModal } from "./GuardrailFormModal";
import { PromptList } from "./PromptList";
import { PromptFormModal } from "./PromptFormModal";
import { TenantLinkSection } from "./TenantLinkSection";
import { useGuardrails } from "@/hooks/useGuardrails";
import { usePrompts } from "@/hooks/usePrompts";
import { useTenantLink } from "@/hooks/useTenantLink";
import type { Guardrail, Prompt } from "@/services/promptManager.types";
import type { GuardrailFormData, PromptFormData } from "@/lib/promptManagerSchemas";
import type { TabId, ModalMode } from "./types";

const TABS = [
  { id: "prompts" as TabId, label: "Prompts Base", icon: MessageSquare },
  { id: "guardrails" as TabId, label: "Guardrails", icon: Shield },
  { id: "tenant-link" as TabId, label: "Vincular Tenant", icon: Link },
];

export function PromptManagerPage() {
  const [activeTab, setActiveTab] = useState<TabId>("prompts");

  // ── Guardrails State ────────────────────────────────────────────
  const guardrailsHook = useGuardrails();

  const [guardrailModal, setGuardrailModal] = useState<ModalMode>(null);
  const [editingGuardrail, setEditingGuardrail] = useState<Guardrail | null>(null);

  const openNewGuardrail = () => {
    setEditingGuardrail(null);
    setGuardrailModal("create");
  };

  const openEditGuardrail = (guardrail: Guardrail) => {
    setEditingGuardrail(guardrail);
    setGuardrailModal("edit");
  };

  const handleGuardrailSubmit = async (data: GuardrailFormData) => {
    if (guardrailModal === "edit" && editingGuardrail) {
      return guardrailsHook.editGuardrail(editingGuardrail.id, data);
    }
    return guardrailsHook.addGuardrail(data);
  };

  // ── Prompts State ───────────────────────────────────────────────
  const promptsHook = usePrompts();

  const [promptModal, setPromptModal] = useState<ModalMode>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const openNewPrompt = () => {
    setEditingPrompt(null);
    setPromptModal("create");
  };

  const openEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setPromptModal("edit");
  };

  const handlePromptSubmit = async (data: PromptFormData) => {
    if (promptModal === "edit" && editingPrompt) {
      return promptsHook.editPrompt(editingPrompt.id, data);
    }
    return promptsHook.addPrompt(data);
  };

  // ── Tenant Link State ───────────────────────────────────────────
  const tenantLinkHook = useTenantLink();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6" aria-live="polite">
      {/* Toast Container */}
      <Toaster richColors position="top-right" />

      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-strong">Prompts &amp; Guardrails</h1>
        <p className="mt-1 text-sm text-text-weak">
          Gerencie guardrails de segurança, modelos de prompts e vínculos com tenants.
        </p>
      </header>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as TabId)} />

      {/* Tab Content — preserve state by rendering all, hiding inactive with display */}
      <div className="mt-6">
        {/* Prompts Tab */}
        <div style={{ display: activeTab === "prompts" ? "block" : "none" }}>
          <PromptList
            prompts={promptsHook.prompts}
            availableGuardrails={promptsHook.guardrails}
            loading={promptsHook.state === "loading"}
            error={promptsHook.error}
            onRefresh={promptsHook.refreshPrompts}
            onEdit={openEditPrompt}
            onDelete={promptsHook.removePrompt}
            onNew={openNewPrompt}
          />
        </div>

        {/* Guardrails Tab */}
        <div style={{ display: activeTab === "guardrails" ? "block" : "none" }}>
          <GuardrailList
            guardrails={guardrailsHook.guardrails}
            loading={guardrailsHook.state === "loading"}
            error={guardrailsHook.error}
            onRefresh={guardrailsHook.refreshGuardrails}
            onEdit={openEditGuardrail}
            onDelete={guardrailsHook.removeGuardrail}
            onNew={openNewGuardrail}
          />
        </div>

        {/* Tenant Link Tab */}
        <div style={{ display: activeTab === "tenant-link" ? "block" : "none" }}>
          <TenantLinkSection
            prompts={tenantLinkHook.prompts}
            loading={tenantLinkHook.loading}
            error={tenantLinkHook.error}
            submitting={tenantLinkHook.submitting}
            fetchingDetail={tenantLinkHook.fetchingDetail}
            tenantDetail={tenantLinkHook.tenantDetail}
            onLink={tenantLinkHook.linkTenant}
            onFetchDetail={tenantLinkHook.fetchDetail}
            onClearDetail={tenantLinkHook.clearDetail}
          />
        </div>
      </div>

      {/* Guardrail Form Modal */}
      <GuardrailFormModal
        open={guardrailModal !== null}
        mode={guardrailModal ?? "create"}
        initial={editingGuardrail}
        onClose={() => setGuardrailModal(null)}
        onSubmit={handleGuardrailSubmit}
      />

      {/* Prompt Form Modal */}
      <PromptFormModal
        open={promptModal !== null}
        mode={promptModal ?? "create"}
        initial={editingPrompt}
        availableGuardrails={promptsHook.guardrails}
        onClose={() => setPromptModal(null)}
        onSubmit={handlePromptSubmit}
      />
    </div>
  );
}
