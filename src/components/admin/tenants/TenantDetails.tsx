import { CalendarDays, Globe2, Pencil } from "lucide-react";
import type { Tenant } from "@/services";
import { DeleteAction } from "@/components/admin/DeleteAction";
import { TenantSnippet } from "./TenantSnippet";

type TenantDetailsProps = {
  tenant: Tenant;
  onEdit: () => void;
  onDelete: () => void;
};

function formatDate(value: string | null, emptyLabel = "Não informado") {
  if (!value) return emptyLabel;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function TenantDetails({ tenant, onEdit, onDelete }: TenantDetailsProps) {
  const active = tenant.deleted_at === null;
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
            <DeleteAction onClick={onDelete} />
          </div>
        )}
      </header>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase text-text-muted">ID</dt><dd className="mt-1 break-all text-sm text-text-strong">{tenant.id}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-text-muted">Google Calendar</dt><dd className="mt-1 flex min-w-0 gap-2 break-all text-sm text-text-strong"><CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />{tenant.google_calendar_id}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-text-muted">Domínios permitidos</dt><dd className="mt-2 flex flex-wrap gap-2">{tenant.allowed_domains.map((domain) => <span key={domain} className="inline-flex max-w-full items-center gap-2 rounded-card border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm text-text-strong"><Globe2 className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="break-all">{domain}</span></span>)}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-text-muted">Criado em</dt><dd className="mt-1 text-sm text-text-strong">{formatDate(tenant.created_at)}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-text-muted">Atualizado em</dt><dd className="mt-1 text-sm text-text-strong">{formatDate(tenant.updated_at, "Nunca atualizado")}</dd></div>
        {tenant.deleted_at && <div><dt className="text-xs font-semibold uppercase text-text-muted">Excluído em</dt><dd className="mt-1 text-sm text-text-strong">{formatDate(tenant.deleted_at)}</dd></div>}
      </dl>
      {active && <TenantSnippet tenant={tenant} />}
    </article>
  );
}