# Research: Placeholders obrigatórios por tipo de prompt + validação ao salvar (026)

## R1 — Onde deve morar a lógica de validação de placeholders

- **Decision**: Funções puras em um novo módulo `src/lib/promptPlaceholders.ts`:
  - `requiredPlaceholdersFor(nodeType): string[]` — tokens obrigatórios do tipo;
  - `missingRequiredPlaceholders(content, nodeType): string[]` — tokens obrigatórios ausentes no texto (verificação literal `content.includes(token)`).
  Os componentes (`PromptFormModal`, `TenantLinkSection`, `PromptPlaceholderHelp`) apenas consomem essas funções — nenhuma lógica de negócio nova em `.tsx`.
- **Rationale**: Constitution I (hooks/UI separados, sem lógica de negócio em `.tsx`) e III (DRY — a mesma regra vale para a tela de prompts e para a customização do vínculo de tenant). A validação é pura e determinística, ideal para `src/lib/` com testes unitários isolados.
- **Alternatives considered**: (a) colocar a checagem inline em cada modal — rejeitado por duplicação e violação de Constitution I; (b) criar um hook `usePlaceholderGuard` — desnecessário, pois não há estado assíncrono nem efeitos colaterais; o estado do alerta é local de tela (padrão já usado no `AdminDialog`).

## R2 — Modelo de vínculo guardrail × node_type (FR-012)

- **Decision**: Não há vínculo guardrail↔nó independente de prompt. Guardrails são N:N ao **Prompt** (`guardrail_ids`), e cada prompt tem um único `node_type` (spec 018). Portanto "os guardrails do tipo" são materializados pelos `guardrail_ids` do prompt daquele tipo. No modal de criação/edição existe um único prompt em edição: ao trocar o "Nó de Destino", a seção de guardrails é re-renderizada em sincronia com o novo tipo, mantendo visíveis **todos** os guardrails disponíveis (selecionados = vinculados ao prompt, desmarcados = não vinculados) e garantindo que os globais (`is_global`) permaneçam sempre na lista com o badge "Global". A seleção do formulário (`guardrail_ids`) nunca é zerada nem dessincronizada pela troca.
- **Rationale**: É o modelo real do backend (agendamento-ia, specs 003/018) — o frontend adapta-se ao backend, não o contrário. "Refresh" pedido pelo usuário = a tela nunca mostra estado desatualizado após a troca; o vínculo por nó continua sendo operado via prompts por nó (cada nó tem seu prompt com seus guardrails).
- **Alternatives considered**: (a) endpoint novo "guardrails por node_type" — exigiria mudança de backend e de contrato, fora do escopo desta feature; (b) zerar a seleção ao trocar o tipo — rejeitado: perderia os guardrails já vinculados ao prompt em edição e contradiz "mostrar os que foram selecionados e os que não foram".

## R3 — Padrão de UI para o alerta de placeholders ausentes (FR-007/008/009, FR-015)

- **Decision**: Componente reutilizável `MissingPlaceholdersAlert` em `src/components/admin/prompt-manager/`, renderizado como overlay interno do dialog (`role="alertdialog"`, `aria-label`), seguindo o padrão existente de confirmação de descarte do `AdminDialog`. Conteúdo: lista os tokens ausentes e oferece duas ações — "Corrigir" (fecha o alerta, formulário intacto) e "Salvar mesmo assim" (prossegue com o submit). Usado em `PromptFormModal` e `TenantLinkSection` (mesmo componente = DRY).
- **Rationale**: `AdminDialog` já implementa overlay com `role="alertdialog"`, focus management e prevenção de fechamento acidental — reusar o padrão garante consistência visual e de acessibilidade (Constitution VII). Componente compartilhado evita duplicação (Constitution III). O alerta é um estado transitório de tela (não persistido), coerente com a spec.
- **Alternatives considered**: (a) `window.confirm` — rejeitado (não customizável, acessibilidade pobre, inconsistente com a identidade visual); (b) toast com botão de ação — rejeitado: alerta com decisão de duas vias precisa de bloqueio modal explícito; (c) alerta inline sempre visível — rejeitado pela spec (a checagem ocorre no ato de salvar).

## R4 — Fonte única do mapa estático de placeholders

- **Decision**: Mover o mapa (`promptPlaceholderHelp`) de `src/components/admin/prompt-manager/promptPlaceholderHelp.ts` para `src/lib/promptPlaceholders.ts` (dados + funções puras). Atualizar os imports em `PromptPlaceholderHelp.tsx`. `PromptPlaceholderHelp` passa a filtrar `placeholders.filter(p => p.required)` para exibir somente os obrigatórios (FR-001).
- **Rationale**: `src/lib/` é o lugar canônico para dados/lógica compartilhados; a validação (R1) e a exibição passam a usar exatamente a mesma fonte, impossibilitando divergência (FR da spec: "fonte única").
- **Alternatives considered**: (a) manter o mapa em components e importar de lib — inversão de dependência indesejável; (b) duplicar as listas em lib e components — rejeitado por DRY.

## R5 — Validação na tela "Vincular Tenant" (US4, FR-015/016)

- **Decision**: Validar `custom_content_override` somente quando não-vazio após `trim()`, contra os obrigatórios do `node_type` da aba selecionada no momento do clique em "Vincular Tenant". Reutilizar `missingRequiredPlaceholders` e o `MissingPlaceholdersAlert`. Override vazio não é validado (usa o conteúdo base, validado na tela de prompts).
- **Rationale**: O override substitui o conteúdo efetivo do tenant — mesma causa raiz do incidente 1234; o usuário confirmou a inclusão no escopo. A aba selecionada (`selectedNode`) é o `node_type` efetivo do vínculo naquele momento.
- **Alternatives considered**: (a) validar sempre mesmo vazio — rejeitado (sem override não há conteúdo customizado para validar); (b) validar contra todos os 3 tipos — rejeitado (cada aba é um vínculo independente).

## R6 — Escopo de alteração de API/contrato

- **Decision**: Nenhuma mudança de contrato de API, endpoint ou modelo de dados persistido. A feature é 100% frontend: exibição, validação client-side e fluxo de alerta.
- **Rationale**: A spec exige aviso não bloqueante com decisão do administrador; a validação rígida de backend permanece fora do escopo (tickets EDI-51/EDI-52).
- **Alternatives considered**: adicionar validação no backend — rejeitado (fora de escopo e não disponível neste repositório frontend).
