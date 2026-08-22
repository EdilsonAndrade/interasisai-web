"use client";

import { CalendarDays, CalendarOff, Globe2, MessageCircleMore, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Tenant } from "@/services";
import { DeleteAction } from "@/components/admin/DeleteAction";
import { GuardrailScopeBadge } from "@/components/admin/GuardrailScopeBadge";
import { TenantPromptBindingCard } from "@/components/admin/TenantPromptBindingCard";
import type { TenantPromptBindingState } from "@/hooks/useTenantPromptBinding";
import type { TenantNodePromptEntry } from "@/hooks/useTenantNodePrompts";
import type { Prompt, TenantPromptDetail } from "@/services/promptManager.types";
import { TenantSnippet } from "./TenantSnippet";

type TenantDetailsProps = {
  tenant: Tenant;
  onEdit: () => void;
  onDelete: () => void;
  bindingState: TenantPromptBindingState;
  bindingDetail: TenantPromptDetail | null;
  bindingError: string | null;
  bindingLinking: boolean;
  operationalPrompts: Prompt[];
  onLinkPrompt: (promptId: string) => Promise<boolean>;
  institutionalPrompt: TenantNodePromptEntry;
  chitchatPrompt: TenantNodePromptEntry;
};

const READ_ONLY_NODE_LABELS = {
  institutional: "Institucional",
  chitchat: "Chitchat",
} as const;

function ReadOnlyNodePromptCard({
  label,
  entry,
}: {
  label: string;
  entry: TenantNodePromptEntry;
}) {
  if (entry.state === "idle" || entry.state === "loading") return null;

  return (
    <div className="space-y-2 rounded-card border border-border-subtle bg-surface-base/60 p-4">
      <p className="text-xs font-semibold uppercase text-text-body/60">{label}</p>
      {entry.state === "error" && (
        <p role="alert" className="text-sm text-red-300">{entry.error}</p>
      )}
      {entry.state === "missing" && (
        <p className="text-sm text-text-body">Nenhum prompt vinculado (usa o padrão da plataforma).</p>
      )}
      {entry.state === "linked" && entry.detail && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-text-strong">{entry.detail.prompt_titulo}</p>
          {entry.detail.guardrails_associados.length > 0 && (
            <div className="flex flex-col gap-1">
              {entry.detail.guardrails_associados.map((g) => (
                <div key={g.id} className="flex items-center gap-2 rounded-md bg-surface-subtle px-3 py-1.5 text-xs">
                  <span className="font-medium text-text-body">{g.titulo}</span>
                  <GuardrailScopeBadge isGlobal={g.is_global} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string | null, emptyLabel = "Não informado") {
  if (!value) return emptyLabel;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function TenantDetails({
  tenant,
  onEdit,
  onDelete,
  bindingState,
  bindingDetail,
  bindingError,
  bindingLinking,
  operationalPrompts,
  onLinkPrompt,
  institutionalPrompt,
  chitchatPrompt,
}: TenantDetailsProps) {
  const active = tenant.deleted_at === null;
  const router = useRouter();
  const goToWhatsApp = () => {
    const params = new URLSearchParams({ tenantId: tenant.id, instanceName: tenant.name });
    router.push(`/admin/whatsapp?${params.toString()}`);
  };
  return (
    <article className="space-y-5 border-t border-border-subtle pt-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-bold text-text-strong">{tenant.name}</h2>
          {!active && <p className="mt-1 text-sm font-semibold text-red-300">Tenant excluído</p>}
        </div>
        {active && (
          <div className="flex gap-2">
            <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-card border border-border-subtle px-3 py-2 text-sm font-semibold text-text-body hover:bg-surface-subtle">
              <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
            </button>
            <button type="button" onClick={goToWhatsApp} className="inline-flex items-center gap-2 rounded-card border border-border-subtle px-3 py-2 text-sm font-semibold text-text-body hover:bg-surface-subtle">
              <MessageCircleMore className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </button>
            <DeleteAction onClick={onDelete} />
          </div>
        )}
      </header>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase text-text-muted">ID</dt><dd className="mt-1 break-all text-sm text-text-strong">{tenant.id}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-text-muted">Google Calendar</dt><dd className="mt-1 flex min-w-0 gap-2 break-all text-sm text-text-strong"><CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />{tenant.google_calendar_id}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-text-muted">Agendamento</dt><dd className="mt-1 flex min-w-0 items-center gap-2 text-sm text-text-strong">{tenant.scheduling_enabled ? <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" /> : <CalendarOff className="h-4 w-4 shrink-0" aria-hidden="true" />}{tenant.scheduling_enabled ? "Habilitado" : "Desabilitado"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-text-muted">Domínios permitidos</dt><dd className="mt-2 flex flex-wrap gap-2">{tenant.allowed_domains.map((domain) => <span key={domain} className="inline-flex max-w-full items-center gap-2 rounded-card border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm text-text-strong"><Globe2 className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="break-all">{domain}</span></span>)}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-text-muted">Criado em</dt><dd className="mt-1 text-sm text-text-strong">{formatDate(tenant.created_at)}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-text-muted">Atualizado em</dt><dd className="mt-1 text-sm text-text-strong">{formatDate(tenant.updated_at, "Nunca atualizado")}</dd></div>
        {tenant.deleted_at && <div><dt className="text-xs font-semibold uppercase text-text-muted">Excluído em</dt><dd className="mt-1 text-sm text-text-strong">{formatDate(tenant.deleted_at)}</dd></div>}
      </dl>
      {active && (
        <TenantPromptBindingCard
          state={bindingState}
          detail={bindingDetail}
          error={bindingError}
          linking={bindingLinking}
          operationalPrompts={operationalPrompts}
          onLinkPrompt={onLinkPrompt}
        />
      )}
      {active && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyNodePromptCard label={READ_ONLY_NODE_LABELS.institutional} entry={institutionalPrompt} />
          <ReadOnlyNodePromptCard label={READ_ONLY_NODE_LABELS.chitchat} entry={chitchatPrompt} />
        </div>
      )}
      {active && <TenantSnippet tenant={tenant} />}
    </article>
  );
}