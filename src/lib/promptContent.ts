// ============================================================================
// promptContent — validação do marcador dinâmico de guardrails ({guardrails})
// no conteúdo de um prompt (R-004, FR-008). Aviso não bloqueante: remover o
// marcador pode ser intencional, mas não pode passar despercebido.
// ============================================================================

const GUARDRAILS_PLACEHOLDER = "{guardrails}";

export function hasGuardrailsPlaceholder(content: string): boolean {
  return content.includes(GUARDRAILS_PLACEHOLDER);
}
