import type { FollowUpStatus, SessionOutcome } from "@/services/followUpApi.types";

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
}

const STATUS_LABELS: Record<FollowUpStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  enviado: "Enviado",
  descartado: "Descartado",
  opt_out: "Opt-out",
};

const OUTCOME_LABELS: Record<SessionOutcome, string> = {
  fechado: "Fechado",
  pensando: "Pensando",
  sem_resposta: "Sem Resposta",
  recusado: "Recusado",
  em_andamento: "Em Andamento",
};

const STATUS_COLORS: Record<FollowUpStatus, string> = {
  pendente: "bg-amber-400/10 text-amber-300 border border-amber-400/30",
  aprovado: "bg-green-400/10 text-green-300 border border-green-400/30",
  enviado: "bg-blue-400/10 text-blue-300 border border-blue-400/30",
  descartado: "bg-surface-subtle text-text-body border border-border-subtle",
  opt_out: "bg-red-400/10 text-red-300 border border-red-400/30",
};

const OUTCOME_COLORS: Record<SessionOutcome, string> = {
  fechado: "bg-green-400/10 text-green-300 border border-green-400/30",
  pensando: "bg-blue-400/10 text-blue-300 border border-blue-400/30",
  sem_resposta: "bg-orange-400/10 text-orange-300 border border-orange-400/30",
  recusado: "bg-red-400/10 text-red-300 border border-red-400/30",
  em_andamento: "bg-purple-400/10 text-purple-300 border border-purple-400/30",
};

export function formatStatus(status: FollowUpStatus): string {
  return STATUS_LABELS[status] || status;
}

export function formatOutcome(outcome: SessionOutcome): string {
  return OUTCOME_LABELS[outcome] || outcome;
}

export function getStatusColor(status: FollowUpStatus): string {
  return STATUS_COLORS[status];
}

export function getOutcomeColor(outcome: SessionOutcome): string {
  return OUTCOME_COLORS[outcome];
}

export const DRAFT_EDITABLE_OUTCOMES: readonly SessionOutcome[] = ["pensando", "sem_resposta"];

export function isDraftEditable(outcome: SessionOutcome): boolean {
  return DRAFT_EDITABLE_OUTCOMES.includes(outcome);
}
