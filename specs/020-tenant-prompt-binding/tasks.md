---

description: "Task list for Vínculo obrigatório de prompt no tenant e associação em massa"
---

# Tasks: Vínculo obrigatório de prompt no tenant e associação em massa

**Input**: Design documents from `specs/020-tenant-prompt-binding/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api-contract.md](./contracts/api-contract.md), [quickstart.md](./quickstart.md)

**Tests**: incluídos e obrigatórios — a constituição do projeto (princípio IV) declara testes não negociáveis. Todo hook novo tem teste com `renderHook`; todo componente interativo tem teste RTL com queries acessíveis; padrão AAA; API sempre mockada.

**Organization**: tarefas agrupadas por user story (spec.md), na ordem de prioridade P1 → P1 → P2 → P2 → P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1..US5, mapeando para spec.md — ausente em Setup, Foundational e Polish
- Caminhos de arquivo são absolutos em relação à raiz do repositório

---

## Phase 1: Setup

**Purpose**: fechar o maior risco do plano antes de escrever qualquer código — o contrato foi acordado no ticket, mas não validado contra o backend rodando.

- [ ] T001 Executar a Parte 1 do `specs/020-tenant-prompt-binding/quickstart.md` (passos 1.1–1.8) contra o backend local com EDI-43 aplicado, e preencher a tabela "Resultado da validação" no mesmo arquivo. Atenção especial ao passo 1.6 — se a resposta divergir do esperado (`200` com `is_default_prompt: true`), `promptBinding.ts` (T004) muda de forma antes de prosseguir.

**Checkpoint**: contrato confirmado ou divergências registradas e compreendidas antes da Fase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestrutura consumida por múltiplas user stories. Nenhuma história pode ser implementada de forma consistente sem isso.

**⚠️ CRITICAL**: nenhuma tarefa de user story deve começar antes desta fase.

- [X] T002 [P] Criar `src/lib/apiError.ts` exportando `normalizeApiError(status, payload): ApiError`, `ApiErrorCode`, `Blocker` e `ApiError`, reduzindo os três formatos de `detail` (objeto de regra de negócio, lista Pydantic 422, string legada) a `{code, message, blockers, fieldErrors?, retryable}` (R-001, data-model.md §1)
- [X] T003 [P] Testes de `normalizeApiError` cobrindo os três formatos de `detail` + payload malformado/ausente, em `src/lib/apiError.test.ts` (R-008)
- [X] T004 [P] Criar `src/lib/promptBinding.ts` exportando `isPromptBindingMissing(detail: TenantPromptDetail): boolean` = `node_type === "operational" && is_default_prompt === true`, com guarda explícita para nós fora do operacional (R-002, FR-014)
- [X] T005 [P] Testes de `isPromptBindingMissing` (operacional vinculado, operacional sem vínculo, institucional retorna `false` por guarda) em `src/lib/promptBinding.test.ts`
- [X] T006 [P] Criar `src/lib/promptContent.ts` exportando `hasGuardrailsPlaceholder(content: string): boolean` (R-004, FR-008)
- [X] T007 [P] Testes de `hasGuardrailsPlaceholder` (marcador presente, ausente, dentro de texto maior) em `src/lib/promptContent.test.ts`
- [X] T008 Refatorar `requestPromptManager` em `src/services/promptManager.ts` para usar `normalizeApiError` (T002) na resposta de erro, e estender o branch de erro de `PromptManagerResult<T>` em `src/services/promptManager.types.ts` com `code?: ApiErrorCode` e `blockers: Blocker[]` — nenhum comportamento de sucesso muda (FR-032, FR-033)
- [X] T009 Refatorar `tenantFailure`/`requestTenant` em `src/services/pythonBackend.ts` para usar `normalizeApiError` (T002), e estender `TenantOperationFailure` em `src/services/pythonBackend.types.ts` com `code?: ApiErrorCode` e `blockers: Blocker[]` (FR-032, FR-033) (depends on: T002)

**Checkpoint**: normalizador único em produção nos dois serviços; `code`/`blockers` disponíveis para qualquer consumidor. Nenhuma história de usuário ainda foi implementada.

---

## Phase 3: User Story 1 - Cadastrar tenant escolhendo o prompt conscientemente (Priority: P1) 🎯 MVP

**Goal**: o formulário de criação de tenant exige um prompt operacional escolhido conscientemente — sem pré-seleção — com o caminho de criar um prompt novo a partir de um modelo.

**Independent Test**: cadastrar um tenant do zero; verificar que (a) não conclui sem prompt escolhido, (b) o prompt escolhido é o que aparece depois na configuração do tenant.

### Implementation for User Story 1

- [X] T010 [P] [US1] Adicionar `node_type` opcional a `fetchPrompts` em `src/services/promptManager.ts` (query `?node_type=`) — contrato §2 (FR-003)
- [X] T011 [P] [US1] Adicionar `prompt_id: string` a `TenantCreateInput` em `src/services/pythonBackend.types.ts` e enviá-lo no corpo de `createTenant` em `src/services/pythonBackend.ts` — contrato §1 (depends on: T009)
- [X] T012 [P] [US1] Adicionar `prompt_id` a `tenantCreateSchema` em `src/lib/tenantSchemas.ts` com `.trim().min(1, ...)` e mensagem que explica a obrigatoriedade, não só a ausência (FR-002, data-model.md §4)
- [X] T013 [US1] Criar `src/components/admin/PromptSelectField.tsx`: combo dos prompts operacionais sem nenhuma opção pré-selecionada, rótulo visual "Padrão" no prompt `is_default` sem marcá-lo, e modo "criar novo a partir de um modelo" que abre um editor (reaproveitando `MarkdownEditorCustom`) pré-preenchido com o `conteudo` do modelo verbatim, mostrando aviso não bloqueante via `hasGuardrailsPlaceholder` (T006) se o marcador `{guardrails}` for removido; emite `TenantCreateIntent` (`{mode:"existing", prompt_id}` ou `{mode:"new", prompt: PromptCreateInput}`) (FR-004..FR-008, data-model.md §2)
- [X] T014 [US1] Estender `useTenantManagement.ts`: `create` passa a aceitar `TenantCreateIntent`; no modo `"new"` chama `createPrompt` (de `src/services/promptManager.ts`) e, só em caso de sucesso, `createTenant` com o `prompt_id` retornado; se o segundo passo falhar, o prompt criado **não** é desfeito e o erro deixa isso explícito; no modo `"existing"` segue o fluxo atual (FR-009, FR-010, R-003) (depends on: T010, T011, T013)
- [X] T015 [US1] Integrar `PromptSelectField` a `src/components/admin/tenants/TenantForm.tsx` apenas no `mode="create"` — o formulário de edição não ganha campo de prompt (FR-001, FR-011) (depends on: T013)
- [X] T016 [US1] Em `src/components/admin/tenants/TenantManagement.tsx`: consumir `usePrompts()` para listar prompts, filtrar client-side por `node_type === "operational"` (mesmo padrão já usado em `TenantLinkSection.tsx`) para alimentar `PromptSelectField`, chamar `management.create(intent)` e, no modo `"new"` bem-sucedido, `promptsHook.refreshPrompts()` para que o novo prompt apareça na aba Prompts (FR-006) (depends on: T014, T015)

### Tests for User Story 1

- [X] T017 [P] [US1] Teste de `tenantCreateSchema` — rejeita `prompt_id` vazio com a mensagem explicativa, em `src/lib/tenantSchemas.test.ts`
- [X] T018 [P] [US1] Teste de `fetchPrompts` — aplica `node_type` na querystring quando informado, em `src/services/promptManager.test.ts`
- [X] T019 [P] [US1] Teste de `createTenant` — envia `prompt_id` no corpo da requisição, em `src/services/pythonBackend.test.ts`
- [X] T020 [P] [US1] Teste de `PromptSelectField` — nenhuma opção pré-selecionada; prompt padrão rotulado mas não selecionado; alterna para modo "a partir de modelo"; conteúdo copiado preserva `{guardrails}`; aviso não bloqueante ao removê-lo, em `src/components/admin/PromptSelectField.test.tsx`
- [X] T021 [US1] Teste de `useTenantManagement` (`renderHook`) — modo `"existing"` cria direto; modo `"new"` cria prompt então tenant; falha no segundo passo mantém o prompt e a nova tentativa não cria um segundo prompt, em `src/hooks/useTenantManagement.test.ts`
- [X] T022 [US1] Teste de `TenantForm` — bloqueia submissão sem prompt escolhido (Zod); nenhum campo de prompt no modo `edit`, em `src/components/admin/tenants/TenantForm.test.tsx`

**Checkpoint**: US1 completa e testável de forma independente — nenhum tenant novo nasce sem vínculo de prompt.

---

## Phase 4: User Story 2 - Ver e corrigir tenant com configuração quebrada (Priority: P1)

**Goal**: o detalhe do tenant mostra o prompt vinculado ou, na ausência de vínculo próprio, um alerta de erro de configuração com correção in-place — sem nunca apresentar o conteúdo do prompt padrão como configuração vigente, e sem nunca esconder as proteções que continuam valendo.

**Independent Test**: consultar um tenant sem vínculo próprio; verificar que aparece o alerta e que a correção é feita sem sair da tela. Não depende da US1.

### Implementation for User Story 2

- [X] T023 [P] [US2] Criar `src/hooks/useTenantPromptBinding.ts`: busca `TenantPromptDetail` via `fetchTenantPromptDetail` (nó `operational`), deriva o estado com `isPromptBindingMissing` (T004), e expõe `linkPrompt(promptId)` que chama `linkTenantToPrompt` e, em caso de sucesso, rebusca o detalhe do servidor (nunca assume estado local) (FR-012, FR-014, FR-017, FR-018)
- [X] T024 [US2] Criar `src/components/admin/TenantPromptBindingCard.tsx`: estado **linked** exibe só o título do prompt, sem alerta; estado **missing** exibe alerta destacado + CTA "Vincular prompt" (usando `PromptSelectField` em modo simples) — **nunca** renderiza `prompt_conteudo` nesse estado — e mantém `guardrails_associados` sempre visíveis, independentemente do estado (FR-013, FR-015, FR-016, FR-017) (depends on: T023)
- [X] T025 [US2] Embutir `TenantPromptBindingCard` em `src/components/admin/tenants/TenantDetails.tsx`, restrito ao `node_type` operacional (FR-019) (depends on: T024)
- [X] T026 [US2] Fiar `useTenantPromptBinding` em `src/components/admin/tenants/TenantManagement.tsx`: buscar o vínculo ao consultar/exibir um tenant e repassar estado + ação de correção para `TenantDetails` (depends on: T023, T025)

### Tests for User Story 2

- [X] T027 [P] [US2] Teste de `useTenantPromptBinding` (`renderHook`) — deriva `linked`/`missing` corretamente; `linkPrompt` bem-sucedido rebusca do servidor, em `src/hooks/useTenantPromptBinding.test.ts`
- [X] T028 [P] [US2] Teste de `TenantPromptBindingCard` — alerta some quando `linked`; conteúdo do prompt padrão nunca aparece em `missing`; guardrails sempre renderizados; CTA aciona a correção sem navegação, em `src/components/admin/TenantPromptBindingCard.test.tsx`

**Checkpoint**: US1 + US2 juntas formam o MVP completo do ticket — nenhum tenant novo nasce quebrado, e os já quebrados são visíveis e corrigíveis.

---

## Phase 5: User Story 3 - Aplicar um prompt a vários tenants de uma vez (Priority: P2)

**Goal**: da tela de prompts, aplicar um prompt a N tenants em uma única confirmação, com preview de quem muda e quem não muda, e garantia all-or-nothing.

**Independent Test**: selecionar um prompt, aplicar a três tenants, verificar que os três passaram a usá-lo. Testável sem depender de US1/US2.

### Implementation for User Story 3

- [ ] T029 [P] [US3] Criar `src/components/admin/BlockerList.tsx`: renderiza `Blocker[]` com fallback para `id` quando `name` está ausente, e callback opcional de resolução por item (R-006, FR-038)
- [ ] T030 [US3] Adicionar `fetchPromptTenants(promptId)` e `linkTenantsBulk(input)` a `src/services/promptManager.ts`, com os tipos `PromptTenant`, `PromptTenantsResponse`, `BulkTenantLinkInput`, `BulkTenantLinkResponse` em `src/services/promptManager.types.ts` — contrato §3/§4, usando `normalizeApiError` via `requestPromptManager` (depends on: T008)
- [ ] T031 [P] [US3] Adicionar `bulkTenantLinkSchema` a `src/lib/promptManagerSchemas.ts` (`prompt_id` obrigatório, `tenant_ids` mínimo 1) (FR-028, data-model.md §4)
- [ ] T032 [US3] Criar `src/hooks/usePromptTenants.ts`: busca os tenants já vinculados a um prompt via `fetchPromptTenants` (depends on: T030)
- [ ] T033 [US3] Criar `src/hooks/useBulkTenantLink.ts`: seleção de tenants via `searchTenants` (existente), calcula `BulkLinkDiff` (unchanged/changing) por diferença de conjuntos contra `usePromptTenants`, executa `linkTenantsBulk`, e trata `TENANT_NOT_FOUND` expondo os `blockers` e deixando explícito que nada foi aplicado (FR-025..FR-030, R-005) (depends on: T030, T031, T032)
- [ ] T034 [US3] Criar `src/components/admin/prompt-manager/BulkTenantLinkModal.tsx`: busca + seleção em chips (padrão já usado em `TenantForm.tsx` para domínios), separa visualmente "já usam" de "serão alterados", avisa explicitamente sobre substituição e all-or-nothing e que outros nós não são afetados, bloqueia confirmação sem seleção, informa a quantidade vinculada no sucesso, e usa `BlockerList` (T029) para listar tenants inexistentes no erro (FR-023..FR-030) (depends on: T029, T033)
- [ ] T035 [US3] Adicionar a ação "Aplicar a estes tenants" a `src/components/admin/prompt-manager/PromptList.tsx`, abrindo `BulkTenantLinkModal` para o prompt selecionado (FR-023) (depends on: T034)
- [ ] T036 [US3] Fiar `BulkTenantLinkModal` em `src/components/admin/prompt-manager/PromptManagerPage.tsx` (depends on: T034, T035)

### Tests for User Story 3

- [ ] T037 [P] [US3] Teste de `BlockerList` — renderiza nome ou cai para id; aciona callback de resolução, em `src/components/admin/BlockerList.test.tsx`
- [ ] T038 [P] [US3] Teste dos novos endpoints — sucesso, `PROMPT_NOT_FOUND`, `TENANT_NOT_FOUND` com `blockers`, em `src/services/promptManager.test.ts`
- [ ] T039 [P] [US3] Teste de `usePromptTenants` (`renderHook`) em `src/hooks/usePromptTenants.test.ts`
- [ ] T040 [US3] Teste de `useBulkTenantLink` (`renderHook`) — diff correto (unchanged/changing); `TENANT_NOT_FOUND` não aplica nada; bloqueia confirmação sem seleção, em `src/hooks/useBulkTenantLink.test.ts`
- [ ] T041 [US3] Teste de `BulkTenantLinkModal` — separa os dois grupos; texto de substituição e all-or-nothing presente; sucesso mostra contagem; erro lista bloqueadores, em `src/components/admin/prompt-manager/BulkTenantLinkModal.test.tsx`

**Checkpoint**: US3 funciona de forma independente — aplicar a 10 tenants vira uma única confirmação.

---

## Phase 6: User Story 4 - Enxergar as proteções globais que se aplicam ao tenant (Priority: P2)

**Goal**: nas visões do tenant, proteções globais e proteções do prompt aparecem visualmente separadas, com indicação de que as globais são automáticas e não removíveis dali.

**Independent Test**: abrir um tenant com proteções de ambas as origens e verificar que são distinguíveis à primeira vista.

### Implementation for User Story 4

- [ ] T042 [P] [US4] Em `src/components/admin/TenantContextCard.tsx`: particionar `guardrails_associados` por `is_global` em duas seções — "Proteções globais" (com nota de que são somadas automaticamente e não removíveis ali) e "Proteções do prompt" — mantendo a seção global visível mesmo sem proteções do prompt (FR-020, FR-021, FR-022)
- [ ] T043 [US4] Aplicar a mesma partição global/prompt na seção de guardrails de `src/components/admin/TenantPromptBindingCard.tsx` (mesmo critério `is_global`, reaproveitado sem nova abstração) (depends on: T024, T042)

### Tests for User Story 4

- [ ] T044 [P] [US4] Teste de `TenantContextCard` — seções separadas; nota de "automáticas/não removíveis" nas globais; globais persistem sem proteções do prompt, em `src/components/admin/TenantContextCard.test.tsx`
- [ ] T045 [P] [US4] Teste de `TenantPromptBindingCard` — mesma separação nos estados `linked` e `missing`, em `src/components/admin/TenantPromptBindingCard.test.tsx`

**Checkpoint**: a tela nunca mostra menos proteção do que a que o atendimento realmente aplica.

---

## Phase 7: User Story 5 - Entender por que uma exclusão foi recusada (Priority: P3)

**Goal**: recusas de exclusão de prompt ou guardrail mostram quem está bloqueando e como resolver, em vez de um erro cru.

**Independent Test**: tentar excluir um prompt em uso e verificar que os tenants bloqueadores aparecem com caminho de resolução.

### Implementation for User Story 5

- [ ] T046 [US5] Em `src/hooks/usePrompts.ts`: `removePrompt` trata `code === "PROMPT_IN_USE_BY_TENANTS"` expondo `blockers` (em vez da mensagem genérica atual de 409) (FR-034, FR-035) (depends on: T008)
- [ ] T047 [US5] Em `src/hooks/useGuardrails.ts`: `removeGuardrail` trata `code === "GUARDRAIL_IS_GLOBAL"` oferecendo a ação combinada (chama `updateGuardrail` com `is_global: false` e então `deleteGuardrail`, informando explicitamente se o `DELETE` falhar depois de já ter desmarcado o global) e `code === "GUARDRAIL_IN_USE_BY_TENANTS"` expondo `blockers` com `tenant_count` — a precedência do backend (`GUARDRAIL_IS_GLOBAL` vence quando ambos valem) é respeitada por decidir só pelo `code` retornado (FR-036, FR-037) (depends on: T008)
- [ ] T048 [US5] Em `src/components/admin/prompt-manager/PromptList.tsx`: modal de exclusão usa `BlockerList` para `PROMPT_IN_USE_BY_TENANTS`, cada bloqueador com caminho para o fluxo de vínculo daquele tenant (FR-035) (depends on: T029, T046)
- [ ] T049 [US5] Em `src/components/admin/prompt-manager/GuardrailList.tsx`: modal de exclusão usa `BlockerList` para `GUARDRAIL_IN_USE_BY_TENANTS` (com `tenant_count`) e oferece a ação "Desmarcar global e excluir" para `GUARDRAIL_IS_GLOBAL` (FR-036, FR-037) (depends on: T029, T047)

### Tests for User Story 5

- [ ] T050 [P] [US5] Teste de `usePrompts` — 409 expõe `blockers` em vez da mensagem genérica, em `src/hooks/usePrompts.test.ts`
- [ ] T051 [P] [US5] Teste de `useGuardrails` — ação combinada (incluindo falha do `DELETE` após desmarcar), `blockers` com `tenant_count`, precedência do global, em `src/hooks/useGuardrails.test.ts`
- [ ] T052 [P] [US5] Teste de `PromptList` — bloqueadores exibidos com caminho de resolução, em `src/components/admin/prompt-manager/PromptList.test.tsx`
- [ ] T053 [P] [US5] Teste de `GuardrailList` — bloqueadores com `tenant_count`; ação combinada funciona; exclusão sem vínculo conclui normalmente, em `src/components/admin/prompt-manager/GuardrailList.test.tsx`

**Checkpoint**: todas as 5 user stories funcionam de forma independente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: garantias transversais que não pertencem a uma única história.

- [ ] T054 [P] Revisão cruzada: cada consumidor de `ApiError` (T008, T009 e seus usos nas fases 3–7) decide exclusivamente por `code`, nunca por `message` (FR-032); nenhuma tela quebra com o formato legado em string (FR-033, SC-009)
- [ ] T055 [P] Auditoria de acessibilidade: `role="alert"` em todo alerta novo (`TenantPromptBindingCard`, mensagens de erro de `BulkTenantLinkModal`), navegação por teclado completa no multi-select de tenants e no `PromptSelectField`
- [ ] T056 [P] Confirmar que nenhum `console.error`/`console.log` novo registra `conteudo` ou `custom_content_override` (FR-039)
- [ ] T057 Executar a Parte 2 (checklist manual de UI) e a Parte 3 (portões de qualidade: `npm test && npm run lint && npm run build`) do `quickstart.md`, registrando o resultado

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências — roda primeiro e sozinha (valida o contrato antes de qualquer commit de código).
- **Foundational (Fase 2)**: depende da Fase 1. Bloqueia todas as user stories.
- **User Stories (Fase 3+)**: todas dependem da Fase 2. Entre si:
  - US1 (P1) e US2 (P1) não dependem uma da outra nos dados, mas **US2 reutiliza `PromptSelectField` (T013) da US1** no CTA de correção — implementar US1 antes de US2 na prática, mesmo sendo o mesmo P1.
  - US3 (P2) é independente de US1/US2.
  - US4 (P2) depende de `TenantPromptBindingCard` (T024, da US2) para a tarefa T043 — sem US2, T042 (só `TenantContextCard`) ainda entrega valor sozinho.
  - US5 (P3) reaproveita `BlockerList` (T029, criado na US3) — implementar US3 antes de US5 na prática.
- **Polish (Fase 8)**: depende de todas as histórias desejadas estarem completas.

### Parallel Opportunities

- Todas as tarefas `[P]` da Fase 2 rodam em paralelo entre si (arquivos distintos).
- Dentro de cada história, as tarefas de teste marcadas `[P]` rodam em paralelo entre si, mas só depois das tarefas de implementação de que dependem.
- US3 pode ser implementada em paralelo com US1/US2 por outra pessoa, já que não compartilham arquivos (exceto o consumo futuro de `BlockerList` por US5).

---

## Parallel Example: Foundational (Fase 2)

```bash
# Em paralelo, após T001:
Task: "Criar src/lib/apiError.ts"
Task: "Criar src/lib/promptBinding.ts"
Task: "Criar src/lib/promptContent.ts"
```

## Parallel Example: User Story 1

```bash
# Em paralelo, após a Fase 2:
Task: "Adicionar node_type opcional a fetchPrompts em src/services/promptManager.ts"
Task: "Adicionar prompt_id a TenantCreateInput e createTenant em src/services/pythonBackend.ts"
Task: "Adicionar prompt_id a tenantCreateSchema em src/lib/tenantSchemas.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Completar Fase 1 (validação do contrato) e Fase 2 (fundação).
2. Completar Fase 3 (US1) — nenhum tenant novo nasce sem vínculo.
3. Completar Fase 4 (US2) — tenants já quebrados ficam visíveis e corrigíveis.
4. **PARAR e VALIDAR**: rodar a Parte 2 do `quickstart.md` para US1+US2 isoladamente.
5. Esse é o MVP real do ticket — as duas metades do "princípio norteador" (nunca criar quebrado, nunca esconder quebrado).

### Incremental Delivery

1. Setup + Foundational → base pronta.
2. US1 → testar isoladamente → MVP parcial.
3. US2 → testar isoladamente → MVP completo.
4. US3 → testar isoladamente → ganho de eficiência.
5. US4 → testar isoladamente → confiança visual.
6. US5 → testar isoladamente → experiência de erro completa.
7. Polish → portões de qualidade finais.

### Notes

- `[P]` = arquivos diferentes, sem dependência pendente.
- Rodar `npm test` (`--runInBand`), `npm run lint` e `npm run build` a cada checkpoint de história, não só no final.
- Nenhum `fetch` em arquivo `.tsx` — toda chamada nova passa por hook (princípio I da constituição).
- Parar em qualquer checkpoint para validar a história isoladamente antes de seguir para a próxima.
