# Tasks: Busca de Tenant e Gestão da Base de Conhecimento

**Input**: Design documents from `/specs/017-tenant-search-knowledge-base/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Incluídos — Constitution IV é NON-NEGOTIABLE nesta feature (sem renúncia do usuário, diferente de 015). Cada task de implementação já inclui a criação do teste colocalizado (`Componente.tsx` + `Componente.test.tsx`, `hook.ts` + `hook.test.ts`), seguindo o padrão já usado em todo o repositório, em vez de uma subseção TDD separada.

**Nota i18n**: Área administrativa não requer tradução. Todo texto da UI é hardcoded em Português (Brasil) (mesmo padrão de 013/015).

**Nota autenticação**: Nenhuma task abaixo implementa `Authorization: Bearer <admin JWT>` — decisão explícita registrada em spec.md FR-021/FR-022 e Assumptions.

**Organization**: Tasks são agrupadas por user story para permitir implementação e validação independente de cada story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependências entre si)
- **[Story]**: Qual user story esta task pertence (US1, US2, US3)
- Inclui caminho exato do arquivo em cada descrição

---

## Phase 1: Setup

**Purpose**: Confirmar pré-requisitos de ambiente — nenhuma dependência nova, nenhum diretório novo é necessário (todos já existem no projeto)

- [X] T001 Confirmar que `NEXT_PUBLIC_PYTHON_BACKEND_URL` está configurado (`.env.local`) e que o backend expõe os seis endpoints descritos em `specs/017-tenant-search-knowledge-base/contracts/admin-api-contract.md` (checagem manual, ex.: `curl` em `/api/v1/tenants?q=teste`); não requer alteração de código — **Verificado em 2026-08-19**: `http://localhost:8000` já expõe os 6 endpoints (`/openapi.json` confirma `GET /tenants`, `GET/PUT/DELETE /tenants/{id}`, `GET /prompt-manager/tenant/{id}`, `GET/PUT/DELETE /tenants/{id}/knowledge-base`); a resposta real de `/prompt-manager/tenant/1234` confirma o campo `is_default_prompt` (não apenas `prompt_is_default`), validando o fallback defensivo em `TenantContextCard`.

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Tipos, schema Zod e camada de serviço compartilhados que TODAS as user stories dependem

**⚠️ CRITICAL**: Nenhuma user story pode iniciar antes desta fase ser concluída

- [X] T002 [P] Em `src/services/pythonBackend.types.ts`: adicionar `TenantSearchItem`, `TenantSearchSuccess`, `TenantSearchFailure`, `TenantSearchResult`, `KnowledgeBase`, `KnowledgeBaseReadSuccess`, `KnowledgeBaseWriteSuccess`, `KnowledgeBaseDeleteSuccess`, `KnowledgeBaseFailure`, `KnowledgeBaseReadResult`, `KnowledgeBaseWriteResult`, `KnowledgeBaseDeleteResult` conforme `data-model.md`; remover `IngestRequest`, `IngestSuccessResponse`, `IngestErrorResponse`, `IngestSuccess`, `IngestFailure`, `IngestResult` (código morto após T005/T018)
- [X] T003 [P] Em `src/services/promptManager.types.ts`: adicionar o campo `is_default_prompt: boolean` à interface `TenantPromptDetail` (novo campo do contrato — não requer nenhuma outra alteração, `fetchTenantPromptDetail` permanece igual)
- [X] T004 [P] Em `src/lib/tenantSchemas.ts`: adicionar `tenantSearchSchema = z.object({ term: z.string().trim().min(1, "Informe um termo de busca.") })` e exportar `TenantSearchInput = z.infer<typeof tenantSearchSchema>`
- [X] T005 Em `src/services/pythonBackend.ts` (depende de T002): adicionar `searchTenants(term: string, limit?: number, signal?: AbortSignal): Promise<TenantSearchResult>` (`GET /api/v1/tenants?q=&limit=`, lista vazia é sucesso), `getKnowledgeBase(tenantId, signal?)`, `saveKnowledgeBase(tenantId, content, signal?)` (`PUT`), `deleteKnowledgeBase(tenantId, signal?)` (`DELETE`) em `/api/v1/tenants/{tenantId}/knowledge-base`, seguindo o padrão union-type/`requestTenant` já existente no arquivo; remover `ingestKnowledge`
- [X] T006 Em `src/services/pythonBackend.test.ts` (depende de T005): adicionar testes (`fetch` mockado) para `searchTenants` (sucesso com lista, sucesso com lista vazia, 401, 422, falha de rede), `getKnowledgeBase` (com conteúdo, `content: null`, 404), `saveKnowledgeBase` (sucesso, 422 conteúdo vazio, 404), `deleteKnowledgeBase` (sucesso, 404); remover os testes de `ingestKnowledge`
- [X] T007 Em `src/services/index.ts` (depende de T002, T005): adicionar exports de `searchTenants`, `getKnowledgeBase`, `saveKnowledgeBase`, `deleteKnowledgeBase` e dos novos tipos de T002; remover exports de `ingestKnowledge`/`Ingest*`

**Checkpoint**: Fundação pronta — implementação das user stories pode começar

---

## Phase 3: User Story 1 - Buscar tenant e visualizar contexto (Priority: P1) 🎯 MVP

**Goal**: Administrador busca um tenant por nome/ID, seleciona um resultado e vê o prompt aplicável (vinculado ou padrão) e os guardrails associados

**Independent Test**: Com `useTenantSearch`/`useTenantContext`/`TenantSearchBox`/`TenantContextCard` testados isoladamente (serviço mockado) — buscar termo, ver lista de resultados (incl. vazio), selecionar tenant, ver prompt + guardrails (incl. fallback `is_default_prompt: true`)

### Implementation for User Story 1

- [X] T008 [P] [US1] Criar hook `useTenantSearch` em `src/hooks/useTenantSearch.ts` com testes em `src/hooks/useTenantSearch.test.ts` (depende de T002, T004, T005) — estado `idle/loading/success/error`; função `search(term)` valida via `tenantSearchSchema` antes de chamar `searchTenants`; lista vazia é resultado válido (não erro); descarta respostas de buscas anteriores obsoletas (FR-023, usar `AbortController` por chamada); expõe `{ results, loading, error, search, notFound }`
- [X] T009 [P] [US1] Criar hook `useTenantContext` em `src/hooks/useTenantContext.ts` com testes em `src/hooks/useTenantContext.test.ts` (depende de T003, T005) — função `selectTenant(tenantId)` chama `fetchTenantPromptDetail` (reaproveitado de `promptManager.ts`, sem alterações); estado `idle/loading/success/error`; descarta resposta obsoleta quando o tenant selecionado muda antes da resposta anterior chegar (FR-023); expõe `{ detail, loading, error, selectTenant, clear }`
- [X] T010 [P] [US1] Criar componente `TenantSearchBox` em `src/components/admin/TenantSearchBox.tsx` com testes em `src/components/admin/TenantSearchBox.test.tsx` (depende de T008) — formulário `react-hook-form` + `tenantSearchSchema`; campo de busca + botão "Buscar" (ícone `Search`/spinner `Loader2`); lista de resultados como botões selecionáveis (nome + id); estado "Nenhum tenant encontrado" quando lista vazia; mensagem de erro de rede com nova tentativa; prop `onSelect(tenantId)`
- [X] T011 [P] [US1] Criar componente `TenantContextCard` em `src/components/admin/TenantContextCard.tsx` com testes em `src/components/admin/TenantContextCard.test.tsx` (depende de T009) — recebe `detail: TenantPromptDetail | null`, `loading`, `error`; exibe título do prompt + badge "Padrão do Sistema" quando `is_default_prompt === true`; lista de guardrails com badge "Global" quando `is_global`; estado de carregamento e de erro com mensagem

**Checkpoint**: User Story 1 testável isoladamente — busca e contexto funcionam com serviço mockado

---

## Phase 4: User Story 2 - Criar ou editar a base de conhecimento do tenant (Priority: P2)

**Goal**: Administrador visualiza o conteúdo atual da base de conhecimento do tenant selecionado e salva (cria ou edita) via upsert

**Independent Test**: Com `useKnowledgeBase`/`KnowledgeBaseEditor` testados isoladamente (serviço mockado, `tenantId` fixo via prop) — carregar conteúdo existente, carregar estado vazio (`content: null`), editar e salvar com sucesso, salvar com falha (conteúdo preservado), validar limite de 100.000 caracteres e campo obrigatório

**Dependencies**: Phase 2 (Foundational). Independente de Phase 3 para fins de teste unitário (recebe `tenantId` via prop); na tela integrada (Phase 6), depende de um tenant ter sido selecionado via US1.

### Implementation for User Story 2

- [X] T012 [US2] Criar hook `useKnowledgeBase` em `src/hooks/useKnowledgeBase.ts` com testes em `src/hooks/useKnowledgeBase.test.ts` (depende de T002, T005) — para um `tenantId` recebido: `load()` chama `getKnowledgeBase` (estado `idle/loading/loaded/error`, `content` nulo é estado normal); `save(content)` chama `saveKnowledgeBase` (valida não-vazio antes de enviar; estado `saving`; preserva texto editado em falha; sucesso atualiza `content`/`updatedAt` locais); descarta respostas obsoletas quando `tenantId` muda antes da resposta anterior chegar (FR-023); expõe `{ content, updatedAt, loading, saving, error, load, save, setDraft }`
- [X] T013 [US2] Criar componente `KnowledgeBaseEditor` em `src/components/admin/KnowledgeBaseEditor.tsx` com testes em `src/components/admin/KnowledgeBaseEditor.test.tsx` (depende de T012) — recebe `tenantId`; consome `useKnowledgeBase`; textarea vinculada ao rascunho (`content` nulo → área vazia com mensagem "Nenhuma base de conhecimento cadastrada para este tenant"); contador de caracteres e limite de 100.000 (validação de UI); bloqueia envio de conteúdo vazio/só espaços; botão "Salvar" com estado de carregamento; feedback de sucesso "Base de conhecimento salva com sucesso" (toast `sonner`) mencionando que a atualização do comportamento da IA pode levar alguns minutos; feedback de erro preserva o texto editado

**Checkpoint**: User Story 2 testável isoladamente — visualizar/criar/editar a base de conhecimento de um tenant dado

---

## Phase 5: User Story 3 - Excluir a base de conhecimento do tenant (Priority: P3)

**Goal**: Administrador exclui a base de conhecimento existente após confirmação explícita

**Independent Test**: Com `useKnowledgeBase` (estendido) + `KnowledgeBaseDeleteDialog` + `KnowledgeBaseEditor` (estendido) testados isoladamente — acionar exclusão, confirmar no diálogo, ver conteúdo voltar a vazio; cancelar/Escape não exclui e devolve foco; falha preserva conteúdo exibido

**Dependencies**: Phase 4 (US2) — estende o hook e o componente criados ali

### Implementation for User Story 3

- [X] T014 [US3] Modificar `useKnowledgeBase` em `src/hooks/useKnowledgeBase.ts` (+ testes em `useKnowledgeBase.test.ts`, depende de T012) — adicionar `remove()` chamando `deleteKnowledgeBase`; estado `deleting`; sucesso zera `content`/`updatedAt` locais; falha preserva `content` atual e expõe mensagem de erro
- [X] T015 [P] [US3] Criar componente `KnowledgeBaseDeleteDialog` em `src/components/admin/KnowledgeBaseDeleteDialog.tsx` com testes em `src/components/admin/KnowledgeBaseDeleteDialog.test.tsx` (depende de `AdminDialog` existente; mesmo padrão de `TenantDeleteDialog.tsx`) — título "Excluir base de conhecimento?", exibe o `tenant_id`, mensagem "Esta ação não poderá ser desfeita.", ações "Cancelar"/"Excluir" (estilo destrutivo), Cancelar/Escape devolve foco ao controle que abriu o diálogo, botão "Excluir" com estado de carregamento
- [X] T016 [US3] Modificar `KnowledgeBaseEditor` em `src/components/admin/KnowledgeBaseEditor.tsx` (+ testes, depende de T013, T014, T015) — adicionar botão "Excluir" visível apenas quando `content` não é nulo; abre `KnowledgeBaseDeleteDialog`; confirmação chama `remove()` do hook; sucesso fecha o diálogo e mostra "Base de conhecimento excluída com sucesso" (toast); falha mantém o diálogo fechado, preserva conteúdo exibido e mostra erro

**Checkpoint**: Todas as três user stories testáveis isoladamente no nível de componente/hook

---

## Phase 6: Polish & Integração Cross-User-Story

**Purpose**: Orquestrador da tela `/admin`, remoção do fluxo legado, validação final

- [X] T017 Reescrever `AdminDashboard` em `src/components/admin/AdminDashboard.tsx` com testes em `src/components/admin/AdminDashboard.test.tsx` (depende de T010, T011, T013, T016) — `"use client"`; mantém `<Toaster richColors />` (ou reaproveita o já existente no layout admin, verificar); estado do `tenant_id` selecionado; renderiza `TenantSearchBox`; ao selecionar, dispara `useTenantContext.selectTenant` e monta `tenantId` para `KnowledgeBaseEditor`; renderiza `TenantContextCard` e `KnowledgeBaseEditor` somente após uma seleção; ao trocar de tenant, garante que hooks descartem respostas do tenant anterior (FR-023, já implementado nos hooks — cobrir com teste de integração no orquestrador)
- [X] T018 Remover código morto (depende de T017): apagar `src/components/admin/IngestForm.tsx`, `src/hooks/useAdminIngest.ts`, `src/hooks/useAdminIngest.test.ts`; rodar uma busca (`grep`) por `IngestForm`, `useAdminIngest`, `ingestKnowledge` no repositório para confirmar que nenhuma referência restante existe fora de specs/histórico
- [X] T019 [P] Validar edge cases de `spec.md` e `quickstart.md` manualmente ou com testes adicionais: resultado de busca com múltiplos tenants de nome semelhante, troca rápida de tenant durante operação pendente (nenhum dado desatualizado sobrescreve o tenant atual — SC-007), exclusão indisponível quando não há conteúdo, salvamento logo após exclusão, conteúdo muito longo não quebra layout
- [X] T020 Rodar `npm test` e `npm run lint` na raiz do projeto e corrigir falhas em qualquer arquivo novo/alterado desta feature
- [ ] T021 Executar os passos de verificação manual 1–8 de `quickstart.md` contra um backend rodando localmente — **Parcialmente verificado em 2026-08-19** via login real + Playwright headless contra `http://localhost:8000` (backend real já rodando, tenants `1234`/`petshop`/`basa` existentes): login funciona, dashboard renderiza, busca por termo sem correspondência mostra "Nenhum tenant encontrado" sem erro de console, busca por `1234` retorna e seleciona o tenant corretamente. **Não executado**: passos 4–7 (criar/editar/excluir a base de conhecimento) foram propositalmente evitados nesta verificação para não gravar dados em um tenant real de um backend compartilhado — recomenda-se repetir os passos 4–7 contra um tenant descartável antes do merge.

**Checkpoint**: Feature completa — `/admin` funcional com busca, contexto e gestão da base de conhecimento integrados

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
└─► Phase 2 (Foundational) ─── BLOCKER para todas as stories
    ├─► Phase 3 (US1: Busca + Contexto, P1) 🎯 MVP
    ├─► Phase 4 (US2: Criar/Editar KB, P2) ─── testável isoladamente, mas UI integrada depende de US1
    │   └─► Phase 5 (US3: Excluir KB, P3) ─── estende hook/componente de US2
    └─► Phase 6 (Polish & Integração) — após US1, US2 e US3

Dentro de cada fase:
  Tarefas [P] podem executar em paralelo
  Tarefas sem [P] são sequenciais ou dependem de tarefas anteriores da mesma fase
```

### Story Completion Order

| Story | Priority | Depende de | Entregável |
|-------|----------|-----------|------------|
| US1 - Busca + Contexto | P1 | Phase 2 (Foundational) | Busca de tenant + visualização de prompt/guardrails |
| US2 - Criar/Editar KB | P2 | Phase 2 (Foundational) | Upsert da base de conhecimento (independente de US1 no nível de componente) |
| US3 - Excluir KB | P3 | Phase 4 (US2) | Exclusão da base de conhecimento |

---

## Parallel Execution Examples

### Phase 2 (Foundational) — Executar juntos

```bash
# Paralelizável: T002, T003, T004 (arquivos diferentes, sem dependências entre si)
# T002: src/services/pythonBackend.types.ts
# T003: src/services/promptManager.types.ts
# T004: src/lib/tenantSchemas.ts
# Sequencial após: T005 (depende de T002) → T006 (depende de T005) → T007 (depende de T002, T005)
```

### Phase 3 (US1) — Executar juntos

```bash
# Paralelizável entre si: T008, T009 (hooks independentes, ambos só dependem da Foundational)
# T008: src/hooks/useTenantSearch.ts
# T009: src/hooks/useTenantContext.ts
# Paralelizável entre si (após T008/T009 concluídos): T010, T011
# T010: src/components/admin/TenantSearchBox.tsx (depende de T008)
# T011: src/components/admin/TenantContextCard.tsx (depende de T009)
```

### Phase 5 (US3) — Executar juntos

```bash
# Paralelizável: T014 (hook), T015 (dialog) — arquivos diferentes
# T014: src/hooks/useKnowledgeBase.ts
# T015: src/components/admin/KnowledgeBaseDeleteDialog.tsx
# Sequencial após: T016 (depende de T014 e T015)
```

---

## Implementation Strategy

### MVP (Minimum Viable Product)

**Scope**: Phase 1 → Phase 2 → Phase 3 (US1) → Phase 6 (mínimo: T017 exibindo apenas busca + contexto, sem gestão de base de conhecimento ainda)

Entregar a busca de tenant com visualização de contexto primeiro valida a integração com os três endpoints de leitura mais simples (`/tenants?q=`, `/prompt-manager/tenant/{id}`) antes de investir na gestão de escrita/exclusão da base de conhecimento.

### Incremental Delivery

1. **Sprint 1 (MVP)**: Setup + Foundational + US1 (busca + contexto) + integração mínima no `AdminDashboard`
2. **Sprint 2**: US2 (criar/editar base de conhecimento) integrado ao `AdminDashboard`
3. **Sprint 3**: US3 (excluir base de conhecimento) + remoção do fluxo legado de ingestão (T018) + validação final

### Total Task Count

| Phase | Tasks | Paralelizáveis |
|-------|-------|-----------------|
| Phase 1: Setup | 1 | 0 |
| Phase 2: Foundational | 6 | 3 |
| Phase 3: US1 Busca + Contexto (P1) | 4 | 4 |
| Phase 4: US2 Criar/Editar KB (P2) | 2 | 0 |
| Phase 5: US3 Excluir KB (P3) | 3 | 2 |
| Phase 6: Polish | 5 | 1 |
| **Total** | **21** | **10** |

---

## Notes

- **Sem i18n**: Área administrativa não requer tradução — todo texto UI hardcoded em pt-BR
- **Testes obrigatórios**: Constitution IV — cada hook tem teste via `renderHook`, cada componente tem teste RTL com queries acessíveis (`getByRole`, `getByLabelText`); `fetch` mockado em todos os testes de serviço
- **Sem `any`**: Constitution V — todos os tipos explicitamente definidos em `pythonBackend.types.ts`/`promptManager.types.ts`
- **Sem autenticação Bearer/JWT**: decisão explícita (spec.md FR-021/FR-022) — nenhuma task deve adicionar esse header
- **Reaproveitamento**: `fetchTenantPromptDetail` (`promptManager.ts`) reaproveitado sem alteração de código, só o tipo `TenantPromptDetail` ganha `is_default_prompt`; `AdminDialog` reaproveitado para o diálogo de exclusão
- **Código morto**: `IngestForm.tsx`/`useAdminIngest.ts`/`ingestKnowledge` são removidos (T002, T005, T018) — nenhuma outra tela do projeto os consome (confirmado em research.md)
- **Design tokens**: usar tokens do tema já existentes (`text-text-strong`, `bg-surface-base`, `border-brand-primary`, `rounded-card`, `backdrop-blur-xl`), mesmo padrão de `IngestForm.tsx`/`TenantLookupForm.tsx`
- **Padrão admin**: `src/app/[locale]/admin/page.tsx` (server component, inalterado) já protege via `hasValidAdminSession` e renderiza `AdminDashboard`
