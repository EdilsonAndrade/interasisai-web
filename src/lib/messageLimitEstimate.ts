/**
 * Estima quantas mensagens reais de clientes finais um número de chamadas de
 * LLM representa, dada uma razão de chamadas por mensagem (EDI-63).
 * Retorna null para entradas inválidas (vazio, zero, negativo) — a UI deve
 * tratar isso como "sem estimativa", não como erro.
 */
export function estimateRealMessages(
  llmCalls: number,
  callsPerMessage: number,
): number | null {
  if (!Number.isFinite(llmCalls) || llmCalls <= 0) return null;
  if (!Number.isFinite(callsPerMessage) || callsPerMessage <= 0) return null;
  return Math.ceil(llmCalls / callsPerMessage);
}
