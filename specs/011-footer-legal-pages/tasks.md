# Tasks: Páginas Institucionais do Rodapé

**Input**: Design documents from `/specs/011-footer-legal-pages/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Não foram adicionadas tarefas de testes por user story, pois a especificação não exigiu TDD explicitamente. A validação funcional independente de cada história está descrita em cada fase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Aplicação única Next.js com código-fonte em `src/`
- Rotas App Router em `src/app/`
- Componentes de layout em `src/components/layout/`
- Configuração de navegação em `src/components/layout/navigation.config.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar estruturas compartilhadas para conteúdo institucional e navegação do rodapé.

- [x] T001 [P] Create institutional content model and page payloads in `src/content/institutional-pages.ts`
- [x] T002 [P] Create reusable institutional page renderer component in `src/components/layout/InstitutionalPage.tsx`
- [x] T003 Update `src/components/layout/navigation.config.ts` types to support institutional routes and social visibility flags

**Checkpoint**: Modelo de conteúdo e base de navegação prontos para suportar todas as histórias.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ajustes de infraestrutura de navegação que bloqueiam a entrega das histórias.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update footer institutional route mapping (`Sobre`, `Política de Privacidade`, `Termos`) to `/sobre`, `/politica-de-privacidade`, `/termos` in `src/components/layout/navigation.config.ts`
- [x] T005 Update home anchor targets used by header navigation to stable route hashes in `src/components/layout/navigation.config.ts`
- [x] T006 Implement missing section anchors (`servicos`, `portfolio`, `contato`) in `src/app/page.tsx`
- [x] T007 Align footer rendering to consume typed navigation config without breaking current layout in `src/components/layout/Footer.tsx`

**Checkpoint**: Navegação institucional e âncoras da home estabilizadas; histórias podem iniciar.

---

## Phase 3: User Story 1 - Navegar por páginas institucionais (Priority: P1) 🎯 MVP

**Goal**: Entregar as três páginas institucionais acessíveis pelo rodapé com conteúdo dedicado.

**Independent Test**: A partir da home, clicar em `Sobre`, `Política de Privacidade` e `Termos` no rodapé e validar abertura das páginas corretas com conteúdo institucional.

### Implementation for User Story 1

- [x] T008 [P] [US1] Create `Sobre` page route with metadata and institutional content in `src/app/sobre/page.tsx`
- [x] T009 [P] [US1] Create `Política de Privacidade` page route with metadata and institutional content in `src/app/politica-de-privacidade/page.tsx`
- [x] T010 [P] [US1] Create `Termos` page route with metadata and institutional content in `src/app/termos/page.tsx`
- [x] T011 [US1] Integrate `InstitutionalPage` renderer with `institutional-pages` content model across all legal pages in `src/components/layout/InstitutionalPage.tsx`
- [x] T012 [US1] Ensure footer institutional links preserve visual order and navigate to the new routes in `src/components/layout/Footer.tsx`

**Checkpoint**: Páginas institucionais navegáveis e consistentes para demonstrar o MVP.

---

## Phase 4: User Story 2 - Retornar para tópicos da home pelo mesmo header (Priority: P2)

**Goal**: Garantir que as páginas institucionais usem o mesmo header da home e permitam retorno aos tópicos principais.

**Independent Test**: Abrir qualquer página institucional e usar os links do header para voltar aos tópicos da home (`Serviços`, `Portfólio`, `Contato`).

### Implementation for User Story 2

- [x] T013 [US2] Ensure legal pages render within root layout header/footer flow without route-level layout override in `src/app/sobre/page.tsx`, `src/app/politica-de-privacidade/page.tsx`, `src/app/termos/page.tsx`
- [x] T014 [US2] Normalize header navigation items to home-topic hashes for cross-page navigation in `src/components/layout/navigation.config.ts`
- [x] T015 [US2] Update header desktop/mobile link behavior to preserve navigation consistency when accessed from legal routes in `src/components/layout/Header.tsx`
- [x] T016 [US2] Adjust home section semantics and headings to match header topic navigation targets in `src/app/page.tsx`

**Checkpoint**: Retorno por header validado em desktop e mobile com navegação consistente.

---

## Phase 5: User Story 3 - Exibir contato social priorizado (Priority: P3)

**Goal**: Exibir apenas LinkedIn oficial no rodapé e ocultar Instagram/YouTube na v1.

**Independent Test**: Na home, validar LinkedIn visível e funcional; confirmar ausência de Instagram e YouTube em todas as larguras de tela.

### Implementation for User Story 3

- [x] T017 [US3] Set LinkedIn URL to official InterasisAI profile and mark Instagram/YouTube as hidden in `src/components/layout/navigation.config.ts`
- [x] T018 [US3] Render only visible social channels in footer social list in `src/components/layout/Footer.tsx`
- [x] T019 [US3] Preserve secure external-link attributes (`target`, `rel`) for visible social items in `src/components/layout/Footer.tsx`

**Checkpoint**: Rodapé social aderente ao contrato v1 com apenas LinkedIn ativo.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consolidação final, verificação de regressão e atualização documental.

- [x] T020 [P] Update footer test expectations for institutional routes and social visibility in `src/components/layout/Footer.test.tsx`
- [x] T021 [P] Update header navigation tests to validate cross-page hash navigation behavior in `src/components/layout/Header.test.tsx`
- [x] T022 [P] Add route smoke tests for `sobre`, `politica-de-privacidade`, and `termos` in `src/app/page.test.tsx`
- [x] T023 Run full validation flow from quickstart and adjust documentation notes in `specs/011-footer-legal-pages/quickstart.md`
- [x] T024 Run lint and test suite, then fix any regressions introduced by this feature in `src/components/layout/`, `src/app/`, `src/content/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 pages existing and Foundational completion
- **User Story 3 (Phase 5)**: Depends on Foundational completion and can proceed independently of US2
- **Polish (Phase 6)**: Depends on completion of all targeted user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - MVP base
- **User Story 2 (P2)**: Depends on US1 legal routes to validate return flow from institutional pages
- **User Story 3 (P3)**: Can start after Foundational and does not depend on US2

### Within Each User Story

- Shared config/content updates before route rendering
- Route rendering before navigation polish
- Story-level implementation before cross-cutting validation

### Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel
- **Phase 3**: T008, T009, and T010 can run in parallel (different route files)
- **Phase 6**: T020, T021, and T022 can run in parallel (different test files)

---

## Parallel Example: User Story 1

```bash
# Build legal routes in parallel:
Task: "Create Sobre page route in src/app/sobre/page.tsx"
Task: "Create Política de Privacidade page route in src/app/politica-de-privacidade/page.tsx"
Task: "Create Termos page route in src/app/termos/page.tsx"
```

## Parallel Example: User Story 3

```bash
# Configure social visibility and render behavior in tandem:
Task: "Set social visibility + official LinkedIn URL in src/components/layout/navigation.config.ts"
Task: "Render only visible social links in src/components/layout/Footer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Demonstrate legal-page navigation from footer

### Incremental Delivery

1. Deliver MVP (US1)
2. Add return flow consistency via shared header (US2)
3. Apply social visibility policy (US3)
4. Finalize tests, quickstart checks, lint/test regression sweep

### Parallel Team Strategy

1. Team A: Route pages (US1)
2. Team B: Header/home anchors (US2)
3. Team C: Social visibility and footer behavior (US3)

---

## Notes

- [P] tasks = different files, no dependencies
- [USx] labels are only used inside user-story phases
- All tasks include explicit file paths for direct execution
- Keep implementation aligned with contracts in `specs/011-footer-legal-pages/contracts/`
