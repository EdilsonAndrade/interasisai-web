// ============================================================================
// promptBinding — ponto único de detecção do vínculo de prompt ausente
// (FR-014). Nenhum componente deve ler `is_default_prompt` diretamente para
// decidir esse estado — trocar o sinal, se um dia vier, é editar só aqui.
// ============================================================================

import type { NodeType, TenantPromptDetail } from "@/services/promptManager.types";

/**
 * O sinal (`is_default_prompt`) só é confiável no nó operacional — no
 * institucional o overview recursa para o operacional e o sinal fica
 * indistinguível de herança. A guarda por `node_type` é deliberada: impede
 * uso acidental do helper fora do nó em que ele vale (FR-019).
 */
export function isPromptBindingMissing(
  detail: Pick<TenantPromptDetail, "node_type" | "is_default_prompt">,
): boolean {
  const OPERATIONAL: NodeType = "operational";
  return detail.node_type === OPERATIONAL && detail.is_default_prompt === true;
}
