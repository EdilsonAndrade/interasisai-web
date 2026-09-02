---
description: "Task list for Ingestão de Dados por Múltiplos Arquivos (EDI-39)"
---

# Tasks: Ingestão de Dados por Múltiplos Arquivos

**Input**: Design documents from `specs/030-ingestao-multiplos-arquivos/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/knowledge-base-items-api.md, quickstart.md

**Tests**: Incluídos em todas as fases — a constituição do projeto (Princípio IV) torna testes automatizados não-negociáveis (Jest + React Testing Library, `renderHook` para hooks, padrão AAA).

**Organization**: Tasks agrupadas por user story (spec.md) para permitir entrega e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tasks incompletas)
- **[Story]**: US1–US4, mapeando para as user stories do spec.md
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Projeto único Next.js (ver `plan.md` → Project Structure). Testes colocados junto ao arquivo (`*.test.ts(x)`), sem diretório `tests/` separado.

---

## Phase 1: Setup

**Purpose**: Preparar a pasta de componentes novos. Nenhuma dependência nova é necessária — `zod`, `sonner`, `framer-motion`, `react-hook-form`, `clsx`, `tailwind-merge` já estão em `package.json`.

- [X] T001 Create directory `src/components/admin/knowledgeBaseItems/` for the new item-management components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos, client HTTP e o diálogo de confirmação genérico usados por todas as user stories.

**⚠️ CRITICAL**: Nenhuma user story pode começar antes desta fase.

- [X] T002 [P] Add `KnowledgeBaseItem`, `KnowledgeBaseItemDetail`, `KnowledgeBaseUploadMode`, `DuplicateResolution`, `UploadConflict`, `UploadResult` types (per data-model.md) to `src/services/pythonBackend.types.ts`
- [X] T003 [P] Create Zod schemas for file validation (extension in `.pdf/.xls/.xlsx/.csv`, size ≤ 10MB) and non-empty pasted text in `src/lib/knowledgeBaseItemSchemas.ts`
- [X] T004 Implement `listKnowledgeBaseItems(tenantId)` and `getKnowledgeBaseItem(tenantId, itemId)` in `src/services/pythonBackend.ts` (contract endpoints 1 & 2)
- [X] T005 Implement `uploadKnowledgeBaseItems(tenantId, { files, texts, mode, duplicateResolutions })` in `src/services/pythonBackend.ts`, handling 201/409/422 responses (contract endpoint 3, depends on T002)
- [X] T006 Implement `updateKnowledgeBaseItemContent(tenantId, itemId, content)` in `src/services/pythonBackend.ts` (contract endpoint 4)
- [X] T007 Implement `replaceKnowledgeBaseItemFile(tenantId, itemId, file)` in `src/services/pythonBackend.ts` (contract endpoint 5)
- [X] T008 Implement `deleteKnowledgeBaseItem(tenantId, itemId)` in `src/services/pythonBackend.ts` (contract endpoint 6)
- [X] T009 [P] Unit tests (mocked `fetch`) for the 6 new `pythonBackend.ts` functions, covering success and error/status-code branches, in `src/services/pythonBackend.test.ts` (depends on T004-T008)
- [X] T010 [P] Create generic `ConfirmActionDialog` (title/message/confirm-label/loading props) in `src/components/admin/knowledgeBaseItems/ConfirmActionDialog.tsx`, reusing the visual/glass pattern from `KnowledgeBaseDeleteDialog.tsx`
- [X] T011 [P] RTL tests for `ConfirmActionDialog` (renders, confirm/cancel callbacks, disabled while loading) in `src/components/admin/knowledgeBaseItems/ConfirmActionDialog.test.tsx`
- [X] T012 Create `useKnowledgeBaseItems` hook skeleton with `items`, `loading`, `error` state and a `refresh()`/initial-`list()` call to `listKnowledgeBaseItems` in `src/hooks/useKnowledgeBaseItems.ts` (depends on T004)
- [X] T013 [P] `renderHook` tests for the list/refresh behavior of `useKnowledgeBaseItems` in `src/hooks/useKnowledgeBaseItems.test.ts` (depends on T012)

**Checkpoint**: Tipos, client HTTP, hook base e diálogo de confirmação prontos — user stories podem começar.

---

## Phase 3: User Story 1 - Enviar múltiplos arquivos para compor a base de conhecimento (Priority: P1) 🎯 MVP

**Goal**: Admin envia N arquivos (PDF/XLS/CSV) + texto direto numa única submissão; conteúdo extraído compõe a base de conhecimento do tenant.

**Independent Test**: Tenant sem ingestão prévia; enviar 3 arquivos de formatos diferentes numa submissão; verificar que o conteúdo consolidado (`GET /knowledge-base`) passa a conter os 3 conteúdos.

### Implementation for User Story 1

- [X] T014 [US1] Add `uploadItems({ files, texts, mode })` action to `useKnowledgeBaseItems`, calling `uploadKnowledgeBaseItems` and merging `result.created`/`result.replaced` into `items` state; expose `uploading`/`uploadError` (depends on T005, T012)
- [X] T015 [US1] Create `KnowledgeBaseUploadForm` (multi-file input + pasted-text field) with per-file Zod validation feedback in `src/components/admin/knowledgeBaseItems/KnowledgeBaseUploadForm.tsx` (depends on T003)
- [X] T016 [P] [US1] RTL tests for `KnowledgeBaseUploadForm`: accepts valid files, rejects unsupported extension, rejects file > 10MB, blocks submit with nothing selected, in `src/components/admin/knowledgeBaseItems/KnowledgeBaseUploadForm.test.tsx` (depends on T015)
- [X] T017 [US1] Wire `KnowledgeBaseUploadForm` + `useKnowledgeBaseItems.uploadItems` into `KnowledgeBaseEditor.tsx`, refreshing the consolidated preview (`useKnowledgeBase`) after a successful upload (depends on T014, T015)
- [X] T018 [US1] Extend `KnowledgeBaseEditor.test.tsx` covering: tenant without prior ingestion uploads 2+ files plus pasted text in one submission, and the consolidated content reflects all of them

**Checkpoint**: US1 funcional de forma independente — ingestão greenfield por múltiplos arquivos.

---

## Phase 4: User Story 2 - Escolher entre substituir ou adicionar a uma ingestão existente (Priority: P1)

**Goal**: Toggle append/replace com confirmação obrigatória; nome de arquivo duplicado nunca sobrescreve/duplica silenciosamente.

**Independent Test**: Tenant com ingestão prévia; alternar o toggle entre "substituir" e "adicionar"; confirmar que cada modo pede confirmação e produz o resultado esperado; reenviar um arquivo com nome já existente e resolver via modal de duplicidade.

### Implementation for User Story 2

- [X] T019 [US2] Add append/replace toggle state to `KnowledgeBaseUploadForm`, surfaced to the parent via a callback prop (depends on T015)
- [X] T020 [US2] Wire `ConfirmActionDialog` in `KnowledgeBaseEditor.tsx` before calling `uploadItems`: "substituir tudo" copy when mode=replace, "adicionar" copy when mode=append (depends on T010, T017, T019)
- [X] T021 [US2] Handle 409 in `useKnowledgeBaseItems.uploadItems`: expose `conflicts` (from response body) and a `resolveDuplicatesAndRetry(resolutions)` method that resubmits the same upload with `duplicate_resolutions` filled in (depends on T014)
- [X] T022 [US2] Create `KnowledgeBaseDuplicateDialog` listing conflicting filenames with a per-file "substituir" / "manter ambos" choice in `src/components/admin/knowledgeBaseItems/KnowledgeBaseDuplicateDialog.tsx` (depends on T010)
- [X] T023 [P] [US2] RTL tests for `KnowledgeBaseDuplicateDialog`: renders each conflict, collects per-file choice, submits resolutions, in `src/components/admin/knowledgeBaseItems/KnowledgeBaseDuplicateDialog.test.tsx` (depends on T022)
- [X] T024 [US2] Wire `KnowledgeBaseDuplicateDialog` into `KnowledgeBaseEditor.tsx`, opening on `conflicts` and calling `resolveDuplicatesAndRetry` (depends on T021, T022)
- [X] T025 [P] [US2] `renderHook` tests for `useKnowledgeBaseItems` covering append vs. replace payloads and the 409 → resolve → retry flow, in `src/hooks/useKnowledgeBaseItems.test.ts` (depends on T021)
- [X] T026 [US2] Extend `KnowledgeBaseEditor.test.tsx` covering: replace-all requires confirmation and clears prior items on confirm, cancel aborts with no changes, append requires confirmation, duplicate filename opens the duplicate dialog and resolves per user choice

**Checkpoint**: US2 funcional de forma independente, sobre US1 — fluxo seguro substituir/adicionar com duplicidade tratada.

---

## Phase 5: User Story 3 - Consultar, substituir ou excluir um item individualmente na grid (Priority: P2)

**Goal**: Grid de itens com prévia, modal com conteúdo completo, substituição do arquivo de um item e exclusão individual, sem afetar os demais.

**Independent Test**: Tenant com 2+ itens já ingeridos; abrir o modal de detalhe de um item; substituir o arquivo daquele item; excluir um segundo item; confirmar que os itens não afetados permanecem intactos.

### Implementation for User Story 3

- [X] T027 [P] [US3] Create `KnowledgeBaseItemsGrid` rendering each item's filename (or "Texto colado" when `filename` is `null`), `content_preview`, `content_length` and `updated_at`, with a row click handler, in `src/components/admin/knowledgeBaseItems/KnowledgeBaseItemsGrid.tsx` (depends on T012)
- [X] T028 [P] [US3] RTL tests for `KnowledgeBaseItemsGrid`: renders rows, shows truncated preview, "Texto colado" label for null filename, click opens detail, in `KnowledgeBaseItemsGrid.test.tsx` (depends on T027)
- [X] T029 [US3] Add `getItemDetail(itemId)` action to `useKnowledgeBaseItems`, calling `getKnowledgeBaseItem` and exposing `selectedItem`/`detailLoading` state (depends on T004, T012)
- [X] T030 [US3] Create `KnowledgeBaseItemDetailModal` showing full content with scroll, a "substituir arquivo" file input and an "excluir" button, in `src/components/admin/knowledgeBaseItems/KnowledgeBaseItemDetailModal.tsx` (depends on T010)
- [X] T031 [P] [US3] RTL tests for `KnowledgeBaseItemDetailModal`: renders full content, triggers replace-file flow, triggers delete flow, in `KnowledgeBaseItemDetailModal.test.tsx` (depends on T030)
- [X] T032 [US3] Add `replaceItemFile(itemId, file)` and `deleteItem(itemId)` actions to `useKnowledgeBaseItems`, updating only the affected item/removing it from `items` state without refetching the full list (depends on T007, T008, T012)
- [X] T033 [US3] Wire `ConfirmActionDialog` for "substituir arquivo do item" and "excluir item" inside `KnowledgeBaseItemDetailModal`/`KnowledgeBaseEditor.tsx` (depends on T010, T032)
- [X] T034 [US3] Wire `KnowledgeBaseItemsGrid` + `KnowledgeBaseItemDetailModal` into `KnowledgeBaseEditor.tsx` (depends on T027, T029, T030)
- [X] T035 [P] [US3] `renderHook` tests for `replaceItemFile`/`deleteItem` confirming other items in state stay untouched, in `useKnowledgeBaseItems.test.ts` (depends on T032)
- [X] T036 [US3] Extend `KnowledgeBaseEditor.test.tsx` covering: open item detail, replace item file with confirmation, delete item with confirmation, remaining items unaffected

**Checkpoint**: US3 funcional de forma independente, sobre US1/US2 — gestão completa por item.

---

## Phase 6: User Story 4 - Continuar editando o texto extraído como hoje (Priority: P3)

**Goal**: Edição manual livre do conteúdo de um item, preservando o comportamento atual, agora por item.

**Independent Test**: Editar manualmente o conteúdo de um item já ingerido; salvar; confirmar que a alteração é refletida no item e no preview consolidado.

### Implementation for User Story 4

- [X] T037 [US4] Add editable textarea + save button inside `KnowledgeBaseItemDetailModal`, calling a new `updateItemContent(itemId, content)` action on `useKnowledgeBaseItems` (which calls `updateKnowledgeBaseItemContent`) (depends on T006, T030)
- [X] T038 [P] [US4] RTL test for `KnowledgeBaseItemDetailModal` covering manual content edit + save (including empty-content validation), in `KnowledgeBaseItemDetailModal.test.tsx` (depends on T037)
- [X] T039 [P] [US4] `renderHook` test for `updateItemContent` success/error paths in `useKnowledgeBaseItems.test.ts` (depends on T037)
- [X] T040 [US4] Extend `KnowledgeBaseEditor.test.tsx` confirming an edited item's content is reflected in the consolidated preview (via `useKnowledgeBase` refresh) after save

**Checkpoint**: Todas as user stories funcionais de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T041 [P] Accessibility pass across `src/components/admin/knowledgeBaseItems/*`: semantic roles, `role="dialog"` + focus management on modals, keyboard navigation on grid rows
- [X] T042 [P] Run `npm run lint` and fix any issues introduced by this feature
- [X] T043 [P] Run `npm test` for the full suite and confirm no regressions in existing `KnowledgeBaseEditor`/`useKnowledgeBase` tests
- [ ] T044 Run `quickstart.md` manual validation end-to-end against a backend implementing the contract in `contracts/knowledge-base-items-api.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — bloqueia todas as user stories
- **US1 (Phase 3)**: depende do Foundational
- **US2 (Phase 4)**: depende do Foundational; reutiliza `KnowledgeBaseUploadForm`/`uploadItems` de US1 (adiciona toggle + confirmação + duplicidade) — testável isoladamente assumindo US1 implementada
- **US3 (Phase 5)**: depende do Foundational; independente de US1/US2 na lógica (list/detail/replace-file/delete são ações próprias), mas compartilha a tela via `KnowledgeBaseEditor.tsx`
- **US4 (Phase 6)**: depende do Foundational e da existência do `KnowledgeBaseItemDetailModal` (US3)
- **Polish (Phase 7)**: depende de todas as stories desejadas estarem completas

### Parallel Opportunities

- T002, T003 em paralelo (arquivos diferentes)
- T009, T010/T011 em paralelo após T004-T008
- Dentro de cada story, tasks marcadas `[P]` (componentes/testes em arquivos distintos) rodam em paralelo
- US3 pode ser desenvolvida em paralelo a US2 por outra pessoa, já que ambas só dependem do Foundational (integração final em `KnowledgeBaseEditor.tsx` é o ponto de junção)

---

## Parallel Example: Foundational Phase

```bash
Task: "Add KnowledgeBaseItem/DuplicateResolution/UploadResult types to src/services/pythonBackend.types.ts"
Task: "Create Zod schemas for file/text validation in src/lib/knowledgeBaseItemValidation.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Create KnowledgeBaseItemsGrid in src/components/admin/knowledgeBaseItems/KnowledgeBaseItemsGrid.tsx"
Task: "RTL tests for KnowledgeBaseItemsGrid in KnowledgeBaseItemsGrid.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (bloqueia todas as stories)
3. Phase 3: US1 — upload múltiplo greenfield
4. **STOP and VALIDATE**: testar US1 isoladamente (ver Independent Test acima)

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → validar → (MVP)
3. US2 → validar (substituir/adicionar + duplicidade)
4. US3 → validar (grid + gestão por item)
5. US4 → validar (edição preservada)
6. Polish

---

## Notes

- `[P]` = arquivos diferentes, sem dependência entre si
- `[Story]` mapeia a task para a user story do spec.md para rastreabilidade
- Testes seguem AAA e mockam `pythonBackend.ts` (constituição, Princípio IV)
- Migração automática de tenants legados (FR-013) é responsabilidade do backend — nenhuma task de frontend é necessária além de a grid já tratar corretamente `filename: null` (T027)
- Evitar: tasks vagas, conflito no mesmo arquivo marcado `[P]`, dependências cruzadas entre stories que quebrem a independência
