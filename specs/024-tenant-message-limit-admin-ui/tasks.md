# Tasks: Limite de mensagens por tenant — UI Admin (EDI-63)

**Input**: Feature specification from `specs/024-tenant-message-limit-admin-ui/spec.md`  
**Alignment**: Backend tasks in `../agendamento-ia/specs/010-tenant-message-limit/tasks.md` (Phase 3+)  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/custom-hooks.md, quickstart.md

**Tests**: Sim — Princípio IV da constituição (Testes Unitários — NON-NEGOTIABLE)

## Format: `[ID] [P?] [Story] Description with file path`

---

## Phase 1: Setup

- [X] T001 Estender `pythonBackend.types.ts` com tipos: `TenantUsage`, `TenantMessageLimitConfig`, `GlobalRecipient[Create|Update]`
- [X] T002 Criar `src/lib/tenantUsageSchemas.ts` com Zod schemas para `tenantUsageSchema`, `tenantMessageLimitConfigSchema`
- [X] T003 Criar `src/lib/globalRecipientsSchemas.ts` com Zod schemas para `globalRecipientSchema`, `globalRecipientCreateSchema`, `globalRecipientUpdateSchema`
- [X] T004 Estender `src/lib/tenantSchemas.ts` com campos novos: `monthly_message_limit`, `notification_emails` em `tenantWriteSchema` e `tenantCreateSchema`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Bloqueia implementação de todas as user stories.

- [X] T005 [P] Estender `src/services/pythonBackend.ts` com métodos: `getTenantUsage(tenantId)`, `getMessageLimitConfig()`, CRUD para `globalRecipients` (`list`, `create`, `update`, `delete`)
- [X] T006 [P] Estender `src/services/pythonBackend.tenants.test.ts` com testes para novos métodos de API (mock sucesso/erro)
- [X] T007 [P] Implementar `src/hooks/useTenantUsage.ts` (fetch + loading/error/refetch)
- [X] T008 [P] Implementar `src/hooks/useTenantUsage.test.ts` (renderHook AAA pattern, sucesso/404/rede, refetch, mudança de tenantId)
- [X] T009 [P] Implementar `src/hooks/useMessageLimitConfig.ts` (fetch + cache por sessão)
- [X] T010 [P] Implementar `src/hooks/useMessageLimitConfig.test.ts` (renderHook, cache compartilhado, defaults em erro)
- [X] T011 [P] Implementar `src/hooks/useGlobalRecipientsManager.ts` (list + CRUD otimista)
- [X] T012 [P] Implementar `src/hooks/useGlobalRecipientsManager.test.ts` (renderHook, list/create/update/delete, 409 duplicado, 404 não encontrado)

**Checkpoint**: Hooks prontos, testes passam — user stories podem começar.

---

## Phase 3: User Story 1 - Tenant configura limite/e-mails e acompanha consumo (P1) 🎯 MVP

**Goal**: Admin configura `monthly_message_limit` e `notification_emails` no formulário de tenant, visualiza o consumo do mês com cores de alerta.

**Independent Test**: Abrir formulário de edição, preencher limite e e-mails, salvar, reabrir e confirmar persistência; visualizar indicador de consumo com cores certas (verde <50%, amarelo 50-80%, vermelho ≥80%), estado sem limite, e degradação em erro.

### Tests for User Story 1

- [X] T013 [P] [US1] Criar `src/components/admin/tenants/TenantUsageIndicator.test.tsx`: render com dados reais, cores por faixa (green/yellow/red), estado sem limite, estado de carregamento, estado de erro
- [X] T014 [P] [US1] Criar `src/components/admin/tenants/EmailListEditor.test.tsx`: add/remove e-mails, validação de e-mail, rejeição de duplicatas, lista vazia, limite de 10
- [X] T015 [US1] Estender `src/components/admin/tenants/TenantForm.test.tsx`: validação de `monthly_message_limit`, validação de `notification_emails`, persistência via `PUT /tenants/{id}`, mensagens de erro de API refletidas no form

### Implementation for User Story 1

- [X] T016 [P] [US1] Implementar `src/components/admin/tenants/TenantUsageIndicator.tsx`: exibir consumo com barra de progresso/percentual, cores via design tokens, estado sem limite (neutro), estado de carregamento (skeleton), estado de erro (tooltip "Indisponível")
- [X] T017 [P] [US1] Implementar `src/components/admin/tenants/EmailListEditor.tsx`: componente reutilizável com add/remove, validação Zod inline, renderizar lista com remover por item
- [X] T018 [US1] Estender `src/components/admin/tenants/TenantForm.tsx`: adicionar campo `monthly_message_limit` (number input, opcional), adicionar seção `notification_emails` com `<EmailListEditor />`, integrar validação Zod, enviar campos no `PUT /tenants/{id}`
- [X] T019 [US1] Estender `src/components/admin/tenants/TenantDetails.tsx`: renderizar `<TenantUsageIndicator usage={usage} loading={loading} error={error} />` ao topo (usar `useTenantUsage` hook), degradação graciosa em erro da API
- [X] T020 [US1] N/A — `TenantDetails` já recebe `tenant` completo do `TenantManagement` pai; nenhuma mudança de roteamento necessária

**Checkpoint**: US1 completa e testável isoladamente. Admin consegue configurar limite/e-mails e ver consumo.

---

## Phase 4: User Story 2 - Admin gerencia destinatários globais (P2)

**Goal**: Nova tela de "Configurações Globais" lista, adiciona, desativa e remove `global_notification_recipients`.

**Independent Test**: Abrir Configurações Globais, adicionar e-mail, confirmar 409 em duplicado, desativar sem remover, remover, confirmar lista vazia mostra fallback.

### Tests for User Story 2

- [X] T021 [P] [US2] Criar `src/components/admin/tenants/GlobalNotificationRecipients.test.tsx`: render lista, adicionar novo (form), erro 409 duplicado mensagem específica, toggle active, remover com confirmação, lista vazia
- [X] T022 [US2] Criar `src/app/[locale]/admin/global-settings/page.test.tsx`: metadata SEO, navegação funciona, GlobalNotificationRecipients renderiza

### Implementation for User Story 2

- [X] T023 [P] [US2] Implementar `src/components/admin/tenants/GlobalNotificationRecipients.tsx`: list + create form + update/delete actions, usar `useGlobalRecipientsManager` hook, exibir erro 409 de forma clara, mostrar estado vazio com fallback `contato@interasisai.com.br`
- [X] T024 [US2] Criar `src/app/[locale]/admin/global-settings/page.tsx`: nova página com `GlobalNotificationRecipients`, metadata SEO
- [X] T025 [US2] Estender `src/components/admin/AdminNavigation.tsx`: adicionar link para "Configurações Globais" (global-settings)

**Checkpoint**: US2 completa. Admin consegue gerenciar lista global sem acesso direto a API/banco.

---

## Phase 5: User Story 3 - Time comercial usa calculadora de plano (P3)

**Goal**: Calculadora na tela de Configurações Globais estima mensagens reais a partir de chamadas de LLM, com cenários "pior caso" e "médio".

**Independent Test**: Abrir calculadora, informar 1000 chamadas no pior caso, confirmar ~333 mensagens (1000÷3); trocar para médio, confirmar recalcula (sem rede); campo de dica no formulário de tenant mostra estimativa.

### Tests for User Story 3

- [X] T026 [P] [US3] Criar `src/components/admin/tenants/PlanCalculator.test.tsx`: render, inputs (chamadas + cenário), cálculo correto por cenário, input inválido (vazio, negativo, zero) mostra estado neutro, recalcula instantaneamente
- [X] T027 [US3] Estender `src/components/admin/tenants/TenantForm.test.tsx` (US1): verificar dica ao lado de `monthly_message_limit` mostra estimativa correta

### Implementation for User Story 3

- [X] T028 [P] [US3] Implementar `src/components/admin/tenants/PlanCalculator.tsx`: componente reutilizável com inputs (LLM calls + scenario radio), usar `useMessageLimitConfig` hook, calcular `ceil(input / ratio)` via `estimateRealMessages` (compartilhado com a dica do form), exibir estimativa ou estado neutro, sem botão de salvar
- [X] T029 [US3] Integrar `<PlanCalculator />` na página `src/app/[locale]/admin/global-settings/page.tsx` (section "Dimensionamento de Plano")
- [X] T030 [US3] Dica inline (não componente separado) ao campo `monthly_message_limit` em `TenantForm.tsx`, usando `estimateRealMessages` + `useMessageLimitConfig`

**Checkpoint**: US3 completa. Time comercial consegue dimensionar planos via calculadora.

---

## Phase 6: Polish & Cross-Cutting

- [X] T031 [P] Rodar suíte completa: `npx jest` — 612 testes, 594 passando; os 18 que falham (8 suítes) são pré-existentes, confirmados via `git stash` antes de qualquer mudança do EDI-63 (não é regressão)
- [X] T032 [P] `npx tsc --noEmit` — sem erros novos; corrigido bug próprio (`invalid_type_error` → `error`, sintaxe Zod v4) e evitada quebra em cascata de ~8 arquivos de teste fora de escopo tornando `Tenant.monthly_message_limit`/`notification_emails` opcionais (mesmo padrão de `TenantWriteInput`); os 8 erros restantes são pré-existentes (casing `PromptPlaceholderHelp`, `middleware.test.ts`, `pythonBackend.test.ts` chat result)
- [X] T033 Acessibilidade: labels explícitas (`htmlFor`/`id`) em todos os campos novos, `role="alert"` nos erros, `role="progressbar"` com `aria-valuenow` no indicador, `aria-invalid`/`aria-describedby` consistentes com o padrão existente
- [ ] T034 Testar responsividade: admin em mobile (calculadora, lista de e-mails, indicador em TenantDetails) — pendente de verificação manual no browser
- [X] T035 Degradação em erro de rede: coberto por teste (`TenantUsageIndicator` erro/loading, `TenantDetails` "erro não quebra o resto da página", `useMessageLimitConfig` fallback para defaults)
- [X] T036 Sem novos warnings de React nos testes novos (mock de `useMessageLimitConfig`/`useTenantUsage` evita act() warnings de fetch real sem env var)
- [ ] T037 E2E manual (browser) — pendente, requer backend rodando localmente
- [X] T038 Padrão de erro de campo: `monthly_message_limit`/`notification_emails` adicionados ao allowlist de `toTenantFieldErrors` em `pythonBackend.ts`, mesmo padrão dos campos existentes

---

## Dependencies & Execution Order

- **Setup (Fase 1)** → **Foundational (Fase 2)**: bloqueia tudo.
- **US1 (Fase 3)**: depende só de Foundational. MVP.
- **US2 (Fase 4)**: depende só de Foundational; independente de US1 (pode rodar em paralelo).
- **US3 (Fase 5)**: depende só de Foundational; usa `useGetMessageLimitConfig` que já foi testado em Foundational; pode rodar em paralelo a US1 ou US2 (porém dica em TenantForm depende de TenantForm estar pronto → segue US1).
- **Polish (Fase 6)**: depende de todas as stories desejadas estarem prontas.

## Parallel Execution Examples

### Scenario 1: MVP (US1 only)

```
Phase 1 (Setup)
└─ T001-T004 (sequential)
   └─ Phase 2 (Foundational)
      └─ T005-T012 (parallelizable: T005+T006 [API], T007+T008 [useGetTenantUsage], T009+T010 [useGetMessageLimitConfig], T011+T012 [useGlobalRecipientsManager])
         └─ Phase 3 (US1)
            ├─ T013-T015 (tests parallelizable: [P] markers)
            └─ T016-T020 (parallelizable by component: TenantUsageIndicator + EmailListEditor + extend TenantForm + extend TenantDetails)
   └─ Phase 6 (Polish)
      └─ T031-T038 (sequential, depends on code being done)
```

**Estimated time**: ~2-3 days (1 dev), with parallel execution of P-marked tasks within each phase.

### Scenario 2: Full Feature (US1 + US2 + US3)

```
Phase 1 → Phase 2 (same as above, parallelizable)
   └─ Phase 3 (US1): T013-T020 [parallelizable within story]
   ├─ Phase 4 (US2): T021-T025 [parallelizable with US1]
   └─ Phase 5 (US3): T026-T030 [parallelizable with US1 + US2, but T030 depends on TenantForm from US1]
   └─ Phase 6 (Polish): T031-T038
```

**Estimated time**: ~4-5 days (2-3 devs in parallel, 1 dev sequential).

---

## Implementation Strategy

**MVP = Phase 1 + 2 + 3 (US1)**: Formulário + indicador funcionando, sem global settings nem calculadora. Valor entregue: admin consegue configurar limite por tenant e ver consumo em tempo real.

**Incremental Next = Phase 4 + 5**: Configurações Globais + calculadora. Valor agregado: time interno acompanha bloqueios; time comercial dimensiona planos sem entrada de dados manual.

**Polish = Phase 6**: Testes, acessibilidade, documentação. Valor: robustez e manutenibilidade.

---

## Task Checklist Validation

✅ **All tasks follow format**: `- [ ] [ID] [P?] [Story?] Description`
✅ **All IDs sequential**: T001-T038 (38 tasks total)
✅ **All file paths explicit**: `src/hooks/...`, `src/components/...`, `src/lib/...`, `src/app/...`
✅ **All P-markers placed**: Parallelizable tasks marked [P] where safe
✅ **All Story labels placed**: US1, US2, US3 tasks labeled; Setup/Foundational/Polish unlabeled
✅ **Independent test criteria**: Each story has clear acceptance test scenarios
✅ **Dependency graph clear**: Dependencies & Execution Order section maps out flow

---

**Status**: Tasks complete, aligned with backend EDI-63 ticket, independently executable per story.
