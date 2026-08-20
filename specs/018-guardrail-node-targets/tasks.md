---

description: "Task list for 018-guardrail-node-targets (revisado — node_type no Prompt)"
---

# Tasks: Prompts e Guardrails por Nó (Operational/Institutional/Chitchat)

**Input**: Design documents from `/specs/018-guardrail-node-targets/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/prompt-node-type.md, quickstart.md

**Nota**: esta lista substitui a versão original (que assumia `Guardrail.nodes`). Aquela versão foi
implementada e depois revertida ao constatar que o backend real (`agendamento-ia`) adotou `node_type` no
`Prompt`. As tarefas abaixo refletem o trabalho efetivamente realizado, todas concluídas.

**Tests**: Incluídos — Constitution IV exige cobertura para todo novo comportamento.

## Phase 1: Reverter o approach anterior (`Guardrail.nodes`)

- [X] T001 Remover `nodes` de `Guardrail`/`GuardrailCreateInput`/`GuardrailUpdateInput` em `src/services/promptManager.types.ts`
- [X] T002 Remover `nodes` de `guardrailFormSchema` em `src/lib/promptManagerSchemas.ts`
- [X] T003 Remover `normalizeGuardrail` e seu uso em `fetchGuardrails`/`createGuardrail`/`updateGuardrail` em `src/services/promptManager.ts`
- [X] T004 Remover o seletor "Nós Aplicáveis" de `src/components/admin/prompt-manager/GuardrailFormModal.tsx` (volta ao estado pré-feature)
- [X] T005 Remover os badges de nó de `src/components/admin/prompt-manager/GuardrailList.tsx` (volta ao estado pré-feature)
- [X] T006 Excluir `GuardrailFormModal.test.tsx` e `GuardrailList.test.tsx` (testavam comportamento revertido)

## Phase 2: Foundational — `node_type` no `Prompt`

- [X] T007 [P] Adicionar `NodeType = "operational" | "institutional" | "chitchat"`, `Prompt.node_type`, `PromptCreateInput.node_type`/`PromptUpdateInput.node_type` em `src/services/promptManager.types.ts`
- [X] T008 [P] Adicionar `node_type: z.enum([...])` a `promptFormSchema` em `src/lib/promptManagerSchemas.ts`
- [X] T009 Corrigir `TenantPromptDetail` (`prompt_conteudo_base` → `prompt_conteudo`; remover `prompt_is_default`, tornar `is_default_prompt` obrigatório; adicionar `node_type`) em `src/services/promptManager.types.ts`
- [X] T010 Atualizar `fetchTenantPromptDetail(tenantId, nodeType?, signal?)` para anexar `?node_type=...` em `src/services/promptManager.ts`
- [X] T011 [P] Testes do query param `node_type` em `src/services/promptManager.test.ts`
- [X] T012 [P] Testes de `promptFormSchema.node_type` em `src/lib/promptManagerSchemas.test.ts`

## Phase 3: User Story 1 — Nó de Destino no formulário de Prompt (P1)

- [X] T013 [US1] Adicionar seletor "Nó de Destino" (`<select>`, default "operational") em `src/components/admin/prompt-manager/PromptFormModal.tsx`
- [X] T014 [US1] Pré-carregar `node_type` ao editar um prompt existente em `PromptFormModal.tsx`
- [X] T015 [US1] Testes: default "operational", submit com node_type alterado, pré-carregamento em edição — `PromptFormModal.test.tsx`

## Phase 4: User Story 2 & 3 — Badge de nó na listagem (P2/P3)

- [X] T016 [US2/US3] Adicionar badge de `node_type` (Operacional/Institucional/Chitchat) em `src/components/admin/prompt-manager/PromptList.tsx`

## Phase 5: User Story 4 — Seletor de nó na tela de vínculo de tenant (P2)

- [X] T017 [US4] Adicionar seletor de nó (3 abas) em `src/components/admin/prompt-manager/TenantLinkSection.tsx`
- [X] T018 [US4] Filtrar a lista de prompts exibida pelo `node_type` selecionado em `TenantLinkSection.tsx`
- [X] T019 [US4] Atualizar `useTenantLink.fetchDetail`/`linkTenant` para receberem `nodeType` em `src/hooks/useTenantLink.ts`
- [X] T020 [US4] Refetch automático do card "Vínculo Atual" ao trocar de nó com tenant já carregado em `TenantLinkSection.tsx`
- [X] T021 [US4] Corrigir uso de `is_default_prompt` (era `prompt_is_default`, campo inexistente) em `TenantLinkSection.tsx`
- [X] T022 [US4] Testes: filtro por nó, chamadas com `nodeType` correto, refetch ao trocar de nó — `TenantLinkSection.test.tsx`

## Phase 6: Correção incidental — `TenantContextCard`

- [X] T023 Simplificar `TenantContextCard.tsx` para usar apenas `is_default_prompt` (remove fallback defensivo para campo que nunca existiu no backend real)
- [X] T024 Atualizar fixtures de teste (`TenantContextCard.test.tsx`, `useTenantContext.test.ts`, `useTenantLink.test.ts`, `AdminDashboard.test.tsx`) para o novo formato de `TenantPromptDetail`

## Phase 7: Polish

- [X] T025 `npx jest` — 349 passando (2 falhas pré-existentes em `Header.test.tsx`/`Footer.test.tsx`, não relacionadas)
- [X] T026 `npx tsc --noEmit` — zero erros novos (erros pré-existentes em `middleware.test.ts`/`pythonBackend.test.ts` não tocados)
- [X] T027 `npx eslint` nos arquivos alterados — zero erros (apenas warnings pré-existentes de `react-hooks/incompatible-library`)
- [ ] T028 Validar manualmente contra uma instância real do backend (`agendamento-ia`, branch EDI-42) seguindo `quickstart.md` — pendente, depende de ambiente local rodando

---

## Resumo

25/26 tarefas de código concluídas; T028 (validação manual end-to-end contra backend real) é a única
pendência, fora do alcance deste ambiente.
