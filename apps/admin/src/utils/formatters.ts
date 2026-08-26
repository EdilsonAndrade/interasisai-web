import { FollowUpStatus, SessionOutcome } from '../types'

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return isoString
  }
}

export function formatStatus(status: FollowUpStatus): string {
  const statusMap: Record<FollowUpStatus, string> = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    enviado: 'Enviado',
    descartado: 'Descartado',
    opt_out: 'Opt-out',
  }
  return statusMap[status] || status
}

export function formatOutcome(outcome: SessionOutcome): string {
  const outcomeMap: Record<SessionOutcome, string> = {
    fechado: 'Fechado',
    pensando: 'Pensando',
    sem_resposta: 'Sem Resposta',
    recusado: 'Recusado',
    em_andamento: 'Em Andamento',
  }
  return outcomeMap[outcome] || outcome
}

export function getStatusColor(status: FollowUpStatus): string {
  const colorMap: Record<FollowUpStatus, string> = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aprovado: 'bg-green-100 text-green-800',
    enviado: 'bg-blue-100 text-blue-800',
    descartado: 'bg-gray-100 text-gray-800',
    opt_out: 'bg-red-100 text-red-800',
  }
  return colorMap[status]
}

export function getOutcomeColor(outcome: SessionOutcome): string {
  const colorMap: Record<SessionOutcome, string> = {
    fechado: 'bg-green-100 text-green-800',
    pensando: 'bg-blue-100 text-blue-800',
    sem_resposta: 'bg-orange-100 text-orange-800',
    recusado: 'bg-red-100 text-red-800',
    em_andamento: 'bg-purple-100 text-purple-800',
  }
  return colorMap[outcome]
}
