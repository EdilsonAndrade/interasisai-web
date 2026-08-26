# Task Breakdown: Follow-up Admin Panel

**Feature**: EDI-65 — UI: Painel de follow-up (revisão, aprovação e histórico)  
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)  
**Branch**: `025-follow-up-admin-panel` | **Date**: 2026-08-26

---

## Implementation Strategy

**MVP Scope**: Implementar US1 (Follow-up Queue) completo. US2, US3 dependem de US1 infrastructure.  
**Parallel Opportunities**: 
- US1 (fila) e US3 (config) podem ser desenvolvidas em paralelo após foundational tasks
- Componentes reutilizáveis (buttons, cards, modals) podem ser abstratos enquanto US1 é implementada
**Suggested Timeline**: 5 dias (1 dia setup + foundational, 1.5 dias US1, 1 dia US2, 0.5 dias US3, 1 dia US4 + polish)

---

## Phase 1: Setup & Project Initialization

- [ ] T001 Criar estrutura de diretórios conforme `plan.md` (components/, hooks/, context/, types/, services/, validation/, utils/)
- [ ] T002 Instalar dependências: `marked`, `dompurify`, `zod`, `react-hook-form`, `clsx`, `tailwind-merge`
- [ ] T003 Criar `src/types/index.ts` com exports centralizados de todos os types
- [ ] T004 Configurar `src/services/api.ts` com cliente HTTP base (fetch com retry + error handling)

---

## Phase 2: Foundational Infrastructure

**Gate**: Todas as tarefas desta fase DEVEM estar 100% antes de iniciar US1.

- [ ] T005 [P] Criar `src/context/AdminAuthContext.tsx` com useAdminAuth hook (mock role = 'admin')
- [ ] T006 [P] Criar `src/types/followup.ts` com todos os types (FollowUpQueueEntry, FollowUpStatus, SessionOutcome)
- [ ] T007 [P] Criar `src/types/conversation.ts` com ConversationMessage, HistoryState types
- [ ] T008 [P] Criar `src/types/tenant.ts` com TenantConfig, OfferInfo types
- [ ] T009 [P] Criar `src/types/api.ts` com request/response types para todas 5 endpoints
- [ ] T010 [P] Criar `src/validation/schemas.ts` com Zod schemas (EditDraft, ApproveFollowUp, UpdateTenantConfig)
- [ ] T011 [P] Criar `src/utils/offerValidator.ts` com função validateOfferText(draft, ofertaVigente)
- [ ] T012 [P] Criar `src/utils/formatters.ts` com helpers (formatDate, formatStatus, formatOutcome)
- [ ] T013 Implementar `src/services/api.ts` com funções get(), patch() com retry logic (3x exponential backoff)
- [ ] T014 Criar `src/components/shared/LoadingSpinner.tsx` (Framer Motion + Tailwind)
- [ ] T015 Criar `src/components/shared/ErrorBoundary.tsx` com fallback UI
- [ ] T016 Criar `src/components/shared/ConfirmDialog.tsx` (reutilizável para aprovação/rejeição)
- [ ] T017 Criar `src/app/admin/follow-up/layout.tsx` com sidebar navigation + breadcrumbs

---

## Phase 3: User Story 1 — Revisar e Aprovar Rascunhos (P1) ⭐

**Goal**: Fila de follow-up listável, filtrável, editável e aprovável com validação de desconto.  
**Independent Test**: Navegar para painel → ver fila → filtrar → editar rascunho → aprovar → status muda.  
**Acceptance Criteria**:
- [ ] Fila carrega em <2s
- [ ] Filtros aplicam-se corretamente (status, outcome, tenant)
- [ ] Modal de edição abre/fecha sem erros
- [ ] Validação client-side avisa se desconto não-autorizado
- [ ] Aprovação chama PATCH e atualiza Context
- [ ] Botões "Descartar" e "opt_out" funcionam

---

### US1 Implementation Tasks

- [ ] T018 [US1] Criar `src/types/followup.ts` com FollowUpFilters, FollowUpQueueState
- [ ] T019 [US1] Criar `src/context/FollowUpContext.tsx` com provider e useFollowUp hook (state: entries, filters, loading, error)
- [ ] T020 [US1] Criar `src/hooks/useFollowUpQueue.ts` com fetchQueue, setFilters, loading, error states
- [ ] T021 [US1] Implementar `src/services/api.ts` funções: getFollowUpQueue(filters), updateFollowUpStatus(id, status, draft)
- [ ] T022 [P] [US1] Criar `src/components/follow-up/FollowUpCard.tsx` com layout (summary, outcome, draft preview, action buttons)
- [ ] T023 [P] [US1] Criar `src/components/follow-up/FollowUpFilterBar.tsx` com dropdowns (status, outcome, tenant) + search
- [ ] T024 [US1] Criar `src/components/follow-up/FollowUpEditModal.tsx` com textarea editável + validação Zod (DOMPurify para markdown preview)
- [ ] T025 [US1] Criar `src/components/follow-up/FollowUpQueue.tsx` (lista + paginação) com grid de FollowUpCards
- [ ] T026 [US1] Implementar handlers em FollowUpEditModal: onEdit(text), onValidate(), onApprove(), onDiscard(), onOptOut()
- [ ] T027 [US1] Integrar toast notifications (react-toastify ou similar) para feedback de ações (sucesso, erro)
- [ ] T028 [US1] Implementar paginação com "Load More" button (ou página numbers) no FollowUpQueue
- [ ] T029 [P] [US1] Criar testes Jest para useFollowUpQueue hook (mock fetch, test loading/error states, test filter application)
- [ ] T030 [P] [US1] Criar testes RTL para FollowUpCard (render content, test button clicks, test status display)
- [ ] T031 [P] [US1] Criar testes RTL para FollowUpEditModal (render modal, type text, validate, approve)
- [ ] T032 [US1] Criar `src/app/admin/follow-up/page.tsx` main page com FollowUpProvider wrapper + FollowUpQueue component
- [ ] T033 [US1] Exportar metadata (SEO) em page.tsx: title, description, openGraph
- [ ] T034 [US1] Teste E2E manual: filtrar fila → editar rascunho → aprovar → verificar status mudança

---

## Phase 4: User Story 2 — Consultar Histórico de Conversa (P2)

**Goal**: Buscar e visualizar histórico de conversa por tenant/thread com lazy-load seguro (markdown renderizado).  
**Independent Test**: Navegar para aba histórico → buscar tenant/thread → ver timeline de mensagens → scroll/paginar.  
**Acceptance Criteria**:
- [ ] Histórico carrega em <3s (com up to 500 mensagens)
- [ ] Markdown renderiza corretamente (links, bold, listas, sem XSS)
- [ ] Lazy-load/paginação funciona (50 msgs por página)
- [ ] Timestamps exibem corretamente
- [ ] Usuário/assistant roles distinguem-se visualmente

---

### US2 Implementation Tasks

- [ ] T035 [P] [US2] Criar `src/types/conversation.ts` com ConversationHistoryState, HistorySearchParams
- [ ] T036 [US2] Criar `src/hooks/useConversationHistory.ts` com fetchHistory(tenantId, threadId), loadMore()
- [ ] T037 [US2] Implementar `src/services/api.ts` função: getConversationHistory(tenantId, threadId, page, limit)
- [ ] T038 [P] [US2] Criar `src/utils/markdownRenderer.ts` com SafeMarkdown component (marked + DOMPurify)
- [ ] T039 [P] [US2] Criar `src/components/history/MessageRenderer.tsx` (renderiza com markdown, role visual distinction, timestamp)
- [ ] T040 [P] [US2] Criar `src/components/history/ConversationTimeline.tsx` (lista vertical de MessageRenderer)
- [ ] T041 [US2] Criar `src/components/history/ConversationHistory.tsx` (search input, timeline, load more button, paginação)
- [ ] T042 [US2] Implementar lazy-load: "Load More" carrega +50 msgs, desabilita quando hasMore=false
- [ ] T043 [P] [US2] Criar testes RTL para MessageRenderer (render markdown, test XSS prevention, test role styling)
- [ ] T044 [P] [US2] Criar testes RTL para ConversationTimeline (test pagination, test loading states)
- [ ] T045 [US2] Criar testes Jest para useConversationHistory (mock API, test state transitions, test pagination)
- [ ] T046 [US2] Criar `src/app/admin/follow-up/history/page.tsx` com ConversationHistory component
- [ ] T047 [US2] Teste E2E manual: buscar tenant/thread → visualizar histórico completo → paginar → verificar markdown

---

## Phase 5: User Story 3 — Configurar Oferta Vigente por Tenant (P3)

**Goal**: Painel de config permitindo editar oferta_vigente (texto + validade) e retention_days por tenant.  
**Independent Test**: Navegar para config → selecionar tenant → editar oferta → salvar → verificar persistência.  
**Acceptance Criteria**:
- [ ] Config carrega valores atuais
- [ ] Edição de oferta aceita texto livre
- [ ] Data de validade não permite datas no passado
- [ ] Salvar chama PATCH /tenants/:id e mostra feedback
- [ ] Retention_days valida >0

---

### US3 Implementation Tasks

- [ ] T048 [P] [US3] Criar `src/hooks/useTenantConfig.ts` com fetchConfig(tenantId), updateConfig()
- [ ] T049 [US3] Implementar `src/services/api.ts` funções: getTenantConfig(tenantId), updateTenantConfig(tenantId, oferta, retentionDays)
- [ ] T050 [P] [US3] Criar `src/components/config/OfferForm.tsx` com fields (texto, data válida) + validação Zod
- [ ] T051 [P] [US3] Criar `src/components/config/TenantConfigPanel.tsx` com tenant selector + OfferForm + retentionDays input
- [ ] T052 [US3] Implementar save handler: validar com UpdateTenantConfigSchema, chamar PATCH, mostrar toast
- [ ] T053 [P] [US3] Criar testes RTL para OfferForm (type text, set date, validate, submit)
- [ ] T054 [P] [US3] Criar testes Jest para useTenantConfig (mock fetch, test state, test update flow)
- [ ] T055 [US3] Criar `src/app/admin/follow-up/config/page.tsx` com TenantConfigPanel
- [ ] T056 [US3] Teste E2E manual: editar config → salvar → reload → verificar valores persistidos

---

## Phase 6: User Story 4 — Dashboard KPI (P4, Opcional MVP)

**Goal**: Cards com totais pendentes, breakdown por outcome, tenants com oferta expirada, últimas sessões.  
**Independent Test**: Dashboard carrega → mostra números corretos → filters atualizam cards.  
**Acceptance Criteria** (se implementado):
- [ ] Cards renderizam com valores corretos
- [ ] Números atualizam ao filtrar por tenant
- [ ] Ofertas expiradas destacadas em vermelho

---

### US4 Implementation Tasks

- [ ] T057 [P] [US4] Criar `src/components/dashboard/KPICard.tsx` reutilizável (título, número, trend arrow, color variant)
- [ ] T058 [US4] Criar `src/hooks/useDashboardKPIs.ts` agregando dados (total pendentes, breakdown, expiradas)
- [ ] T059 [P] [US4] Criar `src/components/dashboard/FollowUpDashboard.tsx` grid com 4 KPI cards
- [ ] T060 [US4] Implementar filtro por tenant na dashboard (KPIs refletem seleção)
- [ ] T061 [P] [US4] Criar testes RTL para FollowUpDashboard (render cards, test filters, test number updates)
- [ ] T062 [US4] Criar `src/app/admin/follow-up/dashboard/page.tsx` com FollowUpDashboard
- [ ] T063 [US4] Teste E2E manual: dashboard carrega → filtrar tenant → números atualizam

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T064 Implementar loading skeleton screens (Framer Motion) para melhor UX no carregamento
- [ ] T065 Verificar responsividade em mobile (320px), tablet (768px), desktop (1920px) — ajustar Tailwind classes
- [ ] T066 Implementar keyboard navigation (Tab, Enter, Escape) em todos os modals + botões
- [ ] T067 Verificar acessibilidade: ARIA labels, semantic HTML, alt text em imagens (se houver)
- [ ] T068 Criar `src/utils/errorHandler.ts` com função centralizada de tratamento de erros API (toast + logging)
- [ ] T069 Implementar retry logic no cliente (exponential backoff 3x) para requests que falham
- [ ] T070 Adicionar analytics/logging: track user actions (approve, discard, filter) se necessário
- [ ] T071 Criar arquivo `README.md` com instruções de setup, desenvolvimento local, testes
- [ ] T072 Verificar performance: Lighthouse score >90 em desktop (lighthouse CI ou manual)
- [ ] T073 Review final: checklist de Constitution (Hooks/UI, TypeScript, Testes, Acessibilidade, SEO, Segurança)
- [ ] T074 Merge para main após aprovação + CI checks

---

## Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| **Phase 1** | T001-T004 | Setup (4 tasks) |
| **Phase 2** | T005-T017 | Foundational (13 tasks) |
| **Phase 3 (US1)** | T018-T034 | Follow-up Queue (17 tasks) |
| **Phase 4 (US2)** | T035-T047 | History (13 tasks) |
| **Phase 5 (US3)** | T048-T056 | Config (9 tasks) |
| **Phase 6 (US4)** | T057-T063 | Dashboard (7 tasks) |
| **Phase 7** | T064-T074 | Polish (11 tasks) |
| **TOTAL** | **74 tasks** | Complete feature |

---

## Parallelization Guide

### Setup Phase (Sequential)
1. T001 → T002 → T003 → T004 (dependencies)

### Foundational Phase (Parallel)
- T005, T006, T007, T008, T009, T010, T011, T012 can run in parallel (no dependencies)
- T013 depends on T009, T010
- T014, T015, T016 can run in parallel (shared components, no deps)
- T017 depends on earlier tasks

### US1 Phase (Parallel within groups)
- Types/hooks/context: T018, T019, T020, T021 (sequential within, ~1 day)
- Components can start after T020 completes: T022, T023 parallel, then T024, T025, T026, T027
- Tests: T029, T030, T031 parallel (all using completed components/hooks)

### US2 Phase (Parallel)
- T035, T036, T037, T038, T039 can start in parallel
- T040, T041, T042 depend on previous

### Suggested Parallel Execution:
```
Day 1: Phase 1 + Phase 2 (setup + foundational)
Day 2-3: Phase 3 (US1) — fila + aprovação
Day 4: Phase 4 (US2) — histórico
Day 5: Phase 5 (US3) — config + Phase 6 (dashboard) + Phase 7 (polish)
```

---

## MVP Scope (v1.0)

**Minimum Viable Product**: Implement Phase 1 + Phase 2 + Phase 3 (US1 only)

**Deliverables**:
- ✅ Follow-up queue listável e filtrável
- ✅ Edição e aprovação de rascunhos com validação
- ✅ Feedback de sucesso/erro
- ✅ Basic responsiveness (desktop focus)
- ✅ Unit tests for hooks, RTL for components

**Out of MVP (v2.0)**:
- Histórico de conversa (US2)
- Config de ofertas (US3)
- Dashboard KPI (US4)
- Advanced Polish (analytics, advanced UX patterns)

---

## Dependencies & Blocking Issues

**Critical Gate**: EDI-53 backend MUST be complete before T005 starts.  
**Blocking**: 
- T013 (API client) blocks T020, T021, T036, T037, T049
- T017 (layout) blocks T032, T046, T055, T062

**No Circular Dependencies**: All tasks form a DAG (directed acyclic graph).

---

## Success Metrics

✅ All 74 tasks completed  
✅ <1% test failure rate  
✅ Lighthouse score >90  
✅ 100% Constitution compliance  
✅ 0 accessibility issues (axe scan)  
✅ Feature fully functional on desktop + tablet  

---

## Notes

- Each task includes file path for clarity
- Parallelizable tasks marked with [P]
- Story-specific tasks marked with [US1], [US2], [US3], [US4]
- Tests are included (RTL + Jest as per Constitution Principle IV)
- Estimated effort: 5 days for one developer, 3 days for two developers (parallel US1 + US3)
