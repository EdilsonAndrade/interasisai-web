# Phase 0 — Research: Vínculo obrigatório de prompt no tenant

**Feature**: `specs/020-tenant-prompt-binding/` | **Date**: 2026-08-22

Nenhum `NEEDS CLARIFICATION` restou da spec — as quatro ambiguidades foram fechadas com o autor do ticket antes da especificação. Esta fase resolve as decisões **técnicas** que a spec deliberadamente não fixa.

---

## R-001 — Normalização do envelope de erro

**Decision**: criar `src/lib/apiError.ts` exportando `normalizeApiError(status, payload): ApiError`, que reduz os três formatos de `detail` a uma estrutura única `{ code, message, blockers }`. Os dois serviços (`promptManager.ts` e `pythonBackend.ts`) passam a usá-la; nenhum consumidor inspeciona `payload` cru.

**Rationale**: hoje a lógica está duplicada em `getErrorMessage` (promptManager.ts:60) e `getOperationErrorMessage` (pythonBackend.ts), e nenhuma das duas conhece o formato de objeto. Com três formatos em circulação e cinco consumidores decidindo por `code`, espalhar o parsing seria violação direta do princípio DRY. Uma função pura também é o lugar mais barato de testar as três formas.

Os três formatos a suportar:

| Origem | Formato de `detail` | Extração |
|---|---|---|
| Regra de negócio | `{code, message, blockers[]}` | direto |
| Validação Pydantic (422) | `[{loc, msg}, …]` | vira `fieldErrors`; `code` fica `undefined` |
| Legado (500 `DefaultPromptNotConfiguredError`) | string | vira `message`; `code` fica `undefined` |

**Alternatives considered**:
- *Type guard no ponto de uso*: rejeitado — replicaria o parsing em cada consumidor e deixaria o caminho legado sem cobertura.
- *Assumir só o formato novo*: rejeitado — o 500 legado quebraria a renderização (FR-033).

---

## R-002 — Ponto único de detecção do vínculo ausente

**Decision**: `src/lib/promptBinding.ts` exporta `isPromptBindingMissing(detail: TenantPromptDetail): boolean`, implementado hoje como `detail.node_type === "operational" && detail.is_default_prompt === true`. Nenhum componente lê `is_default_prompt` diretamente para essa decisão.

**Rationale**: o FR-014 exige que trocar o sinal não espalhe mudança. O sinal atual é confiável no nó operacional, mas tem ponto cego conhecido no institucional — e existe a possibilidade de o backend ganhar um campo estruturado no futuro (discutido, sem ticket). Concentrar em uma função pura torna a troca uma edição de um arquivo e um teste.

A guarda por `node_type` no próprio helper é deliberada: impede que ele seja usado por engano em um nó onde o sinal não vale.

**Alternatives considered**:
- *Ler `is_default_prompt` no componente*: rejeitado — viola o FR-014 e espalha conhecimento do contrato pela camada de UI.
- *Esperar um campo `binding_status` do backend*: rejeitado — não existe e não há ticket; bloquearia a entrega por uma dependência que ninguém se comprometeu a fazer.

---

## R-003 — Onde vive o fluxo composto "criar prompt → criar tenant"

**Decision**: em `useTenantManagement`, como uma variante de `create` que aceita `{ mode: "existing", prompt_id }` ou `{ mode: "new", prompt: PromptCreateInput }`. O `TenantForm` só reporta a intenção; nenhuma chamada parte do componente.

**Rationale**: o princípio I proíbe fetch em `.tsx`, e este é o caso mais tentador de violar — são duas chamadas encadeadas com tratamento de erro parcial. Manter no hook também deixa o comportamento testável com `renderHook`, incluindo o caminho em que o passo 1 vence e o passo 2 falha (FR-010).

**Alternatives considered**:
- *Hook dedicado `useTenantCreateWithPrompt`*: rejeitado — fragmenta o estado de criação em dois lugares, e `TenantManagement` já consome `useTenantManagement` para feedback, erro e `fieldErrors`.
- *Orquestrar no `TenantManagement.tsx`*: rejeitado — é `.tsx`, violaria o princípio I.

---

## R-004 — Preservação do marcador `{guardrails}`

**Decision**: `src/lib/promptContent.ts` exporta `hasGuardrailsPlaceholder(content: string): boolean`. O modo "criar a partir de modelo" copia o `conteudo` do modelo **verbatim** (sem qualquer renderização) e, se o administrador remover o marcador durante a edição, exibe aviso não bloqueante explicando que as proteções deixarão de ser aplicadas dinamicamente àquele prompt.

**Rationale**: é o risco de maior impacto silencioso da feature. Se o texto for submetido com as proteções já expandidas, o prompt nasce congelado e nada na tela denuncia — o defeito só aparece meses depois, quando um guardrail atualizado não chega ao atendimento. O aviso é não bloqueante porque remover o marcador pode ser intencional; o que não pode é acontecer sem o admin perceber.

**Alternatives considered**:
- *Bloquear o salvamento sem o marcador*: rejeitado — há casos legítimos de prompt sem proteções dinâmicas; a decisão é do admin, desde que informada.
- *Reinjetar o marcador automaticamente*: rejeitado — alteraria o texto do admin sem consentimento, exatamente o tipo de "ajuda escondida" que esta feature existe para eliminar.

---

## R-005 — Preview do diff na associação em massa

**Decision**: duas chamadas fixas. `GET /prompts/{id}/tenants` traz quem já usa o prompt (uma chamada, independente do tamanho da seleção); o diff sai da diferença de conjuntos contra os tenants selecionados. Nenhuma chamada por tenant.

**Rationale**: o mesmo endpoint serve o preview da massa e a confirmação de exclusão de prompt, e devolve exatamente os dados dos `blockers` do 409 — de propósito, para que a lista que o admin vê ao aplicar seja a mesma que veria ao tentar excluir. Divergência entre essas duas visões seria repetir o defeito de origem do ticket.

**Alternatives considered**:
- *Overview por tenant selecionado (N chamadas)*: rejeitado — custo linear para informação que uma consulta resolve.
- *Modo de simulação (`dry_run`) no endpoint de massa*: rejeitado por ora — amplia um contrato recém-fechado; só se o preview atual se mostrar insuficiente.

**Limite aceito**: o preview mostra quem **já usa** o prompt escolhido, não qual prompt cada tenant de destino perde. A confirmação compensa com aviso explícito de substituição (FR-026). Se o admin precisar do detalhe, consulta o tenant individualmente.

---

## R-006 — Componente único de bloqueadores

**Decision**: `BlockerList` em `src/components/admin/`, aceitando `Blocker[]` e um callback opcional de resolução por item. Consumido por: 409 de exclusão de prompt (tenants), 409 de exclusão de guardrail (prompts, com `tenant_count`), e preview da massa (tenants já vinculados).

**Rationale**: o formato dos bloqueadores do tipo tenant é idêntico ao dos tenants retornados pelo endpoint de vínculos — o backend fez isso deliberadamente para permitir o reuso (FR-038). Três componentes distintos renderizando a mesma estrutura seria duplicação gratuita.

---

## R-007 — Escolha de controle para o multi-select de tenants

**Decision**: campo de busca (reusando `GET /tenants?q=`) + lista de resultados com checkbox + área de "selecionados" removíveis, no padrão de chips já usado pelos domínios permitidos no `TenantForm`. Sem biblioteca de terceiros.

**Rationale**: não existe listagem geral de tenants no produto — a seleção precisa nascer de busca de qualquer forma. O padrão de chips já existe no admin, é acessível por teclado e não adiciona dependência. Introduzir um combobox de terceiros contrariaria a orientação de manter o stack enxuto e traria peso de a11y para revalidar.

**Alternatives considered**:
- *Biblioteca de combobox (react-select / cmdk)*: rejeitado — dependência nova para um padrão que o projeto já resolve.
- *Seleção por colagem de IDs*: rejeitado — o admin não decora IDs; a busca por nome é o caminho real.

---

## R-008 — Estratégia de teste dos três formatos de erro

**Decision**: testar a normalização em `apiError.test.ts` (unitário, tabela com os três formatos + payload malformado) e, nos hooks, testar apenas o **comportamento** por `code` — sem repetir o parsing.

**Rationale**: separa o que é lógica pura do que é orquestração. Repetir os três formatos em cada teste de hook inflaria a suíte sem cobrir nada novo. O padrão AAA e o mock de API já são a norma do projeto.

---

## Resumo das decisões

| ID | Decisão | Artefato |
|---|---|---|
| R-001 | Normalizador único de erro | `src/lib/apiError.ts` |
| R-002 | Detecção de vínculo em função pura | `src/lib/promptBinding.ts` |
| R-003 | Fluxo composto de criação no hook | `useTenantManagement.ts` |
| R-004 | Marcador `{guardrails}` verificado, aviso não bloqueante | `src/lib/promptContent.ts` |
| R-005 | Diff da massa por diferença de conjuntos, 2 chamadas | `useBulkTenantLink.ts` |
| R-006 | `BlockerList` reutilizado por 3 consumidores | `src/components/admin/BlockerList.tsx` |
| R-007 | Multi-select por busca + chips, sem dependência nova | `BulkTenantLinkModal.tsx` |
| R-008 | Formatos de erro testados uma vez, na origem | `apiError.test.ts` |
