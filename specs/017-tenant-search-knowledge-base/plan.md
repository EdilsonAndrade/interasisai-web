# Implementation Plan: Busca de Tenant e Gestão da Base de Conhecimento

**Branch**: `017-tenant-search-knowledge-base` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-tenant-search-knowledge-base/spec.md`

## Summary

Substituir o formulário de ingestão única (`IngestForm` + `useAdminIngest`) na tela `/admin` (`AdminDashboard`) por um fluxo de três etapas: (1) busca de tenant por termo com lista de resultados selecionável, consumindo o novo `GET /tenants?q=`; (2) exibição somente-leitura do prompt aplicável e guardrails associados ao tenant selecionado, reaproveitando `fetchTenantPromptDetail` já existente (`promptManager.ts`), agora com o novo campo `is_default_prompt`; (3) visualizar, salvar (criar/editar via upsert) e excluir a base de conhecimento do tenant selecionado, consumindo os três novos endpoints `GET/PUT/DELETE /tenants/{tenant_id}/knowledge-base`. Todos os seis endpoints residem no mesmo backend Python já usado pelo serviço `pythonBackend.ts` (`NEXT_PUBLIC_PYTHON_BACKEND_URL`), então a implementação estende esse serviço em vez de criar uma nova camada de integração. Conforme decidido com o usuário, esta feature não implementa autenticação Bearer/JWT para essas chamadas — o gate de acesso continua sendo a sessão administrativa por cookie já existente.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.2.4, React 19.2.4
**Primary Dependencies**: react-hook-form 7.85 + zod 4.4 + @hookform/resolvers 5.7 (busca e validação do conteúdo da base de conhecimento), sonner 2.x (toast, já usado em 015), lucide-react 1.8, framer-motion 12.38, clsx 2.1 + tailwind-merge 3.5 — todas já presentes em `package.json`; nenhuma dependência nova.
**Storage**: N/A — dados persistidos no backend Python/FastAPI; frontend apenas consome REST via `NEXT_PUBLIC_PYTHON_BACKEND_URL`.
**Testing**: Jest + React Testing Library (Constitution IV é NON-NEGOTIABLE nesta feature — não houve renúncia do usuário como em 015). RTL para componentes, `renderHook` para hooks, mocks para `fetch`.
**Target Platform**: Browser (desktop + mobile), Next.js App Router, rota `/admin` já protegida por sessão de cookie (`hasValidAdminSession`).
**Project Type**: Web application (Next.js App Router, projeto frontend único).
**Performance Goals**: Resultado de busca exibido em até 10s (SC-001); contexto prompt/guardrails em até 5s após seleção (SC-002); confirmação de salvamento da base de conhecimento não aguarda a revetorização em segundo plano (contrato confirma resposta imediata).
**Constraints**: Reaproveitar o padrão de serviço union-type já estabelecido (`pythonBackend.ts`, mesma base URL de `getTenantById`/`ingestKnowledge`); NÃO implementar emissão/anexação de `Authorization: Bearer <admin JWT>` (FR-021/FR-022 — escopo de feature futura); remover o caminho de código agora morto (`IngestForm.tsx`, `useAdminIngest.ts`, `ingestKnowledge` em `pythonBackend.ts`) já que este é o único consumidor desses símbolos e o novo endpoint de upsert o substitui.
**Scale/Scope**: 1 tela (`/admin` → `AdminDashboard`), 3 hooks novos, 4 componentes novos + 1 modificado + 2 removidos, 4 funções de serviço novas + 1 reaproveitada sem alteração, 6 endpoints REST (5 novos/alterados + 1 reaproveitado).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| I. Hook/UI Separation | ✅ PASS | Lógica isolada em `useTenantSearch`, `useTenantContext`, `useKnowledgeBase`. Componentes (`TenantSearchBox`, `TenantContextCard`, `KnowledgeBaseEditor`, `KnowledgeBaseDeleteDialog`) apenas consomem retorno dos hooks. Nenhum `fetch` direto em `.tsx`. |
| II. Context API (State) | ✅ PASS | Estado local via hooks — escopo de tela única (`AdminDashboard`), sem necessidade de Context global novo. |
| III. DRY & Componentização | ✅ PASS | Reaproveita `fetchTenantPromptDetail`/`TenantPromptDetail` (015) sem duplicar lógica de busca de prompt/guardrail. Reaproveita `AdminDialog` para o diálogo de exclusão (mesmo padrão de `TenantDeleteDialog`). Remove `IngestForm.tsx`/`useAdminIngest.ts`/`ingestKnowledge` (código morto após a troca de fluxo), evitando duas rotas paralelas para o mesmo dado. |
| IV. Testes Unitários | ✅ PASS (obrigatório) | RTL para os 4 componentes novos/alterados; `renderHook` para os 3 hooks novos, cobrindo sucesso, vazio, 404/422 e falha de rede; `fetch` mockado nos testes de serviço (`pythonBackend.test.ts`). |
| V. TypeScript & Erros | ✅ PASS | `any` proibido. Tipos novos em `pythonBackend.types.ts` (`TenantSearchResult`, `KnowledgeBase*`) e extensão de `TenantPromptDetail` em `promptManager.types.ts`. Falhas de rede/API capturadas e refletidas via toast (`sonner`) e estados inline, seguindo o union type `{ ok, status, message, retryable }` já usado em `pythonBackend.ts`. |
| VI. Identidade Visual | ✅ PASS | Tailwind-only; cartão de contexto e editor reutilizam tokens já em uso (`bg-surface-base/60`, `border-brand-primary/20`, `rounded-card`, `backdrop-blur-xl`). Hover scale ≤ 1.05 no botão de salvar (mesmo padrão do `IngestForm` atual). |
| VII. SEO & Acessibilidade | ✅ PASS | `metadata` do `page.tsx` de `/admin` inalterado. Labels associadas em busca e editor; erros e toasts com `role="alert"`/anúncio assistivo; lista de resultados navegável por teclado. |
| VIII. Segurança | ✅ PASS | Sem `dangerouslySetInnerHTML` (conteúdo da base de conhecimento é texto puro, não Markdown). Termo de busca e conteúdo da base de conhecimento validados com Zod antes do envio. Nenhuma secret nova em `NEXT_PUBLIC_`. CSP existente inalterada (mesma base URL já permitida). |

**Result**: ALL GATES PASS. Nenhuma violação — Complexity Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/017-tenant-search-knowledge-base/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── admin-api-contract.md   # API contract (already captured during /speckit.specify)
└── tasks.md              # Phase 2 output (future /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── [locale]/
│       └── admin/
│           └── page.tsx                         # [UNCHANGED] já protege via hasValidAdminSession e renderiza AdminDashboard
├── components/
│   └── admin/
│       ├── AdminDashboard.tsx                    # [MODIFIED] orquestrador: busca → contexto → base de conhecimento
│       ├── AdminDialog.tsx                       # [EXISTING] reaproveitado para o diálogo de exclusão
│       ├── TenantSearchBox.tsx                   # [NEW] campo de busca por termo + lista de resultados selecionável
│       ├── TenantContextCard.tsx                 # [NEW] cartão somente-leitura: prompt aplicável + guardrails
│       ├── KnowledgeBaseEditor.tsx                # [NEW] textarea + salvar (upsert), estado vazio/carregado
│       ├── KnowledgeBaseDeleteDialog.tsx          # [NEW] confirmação de exclusão (wrapper de AdminDialog)
│       ├── IngestForm.tsx                        # [REMOVED] substituído por KnowledgeBaseEditor
├── hooks/
│   ├── useTenantSearch.ts                        # [NEW] busca por termo → lista de tenants
│   ├── useTenantContext.ts                       # [NEW] wrapper somente-leitura de fetchTenantPromptDetail para o tenant selecionado
│   ├── useKnowledgeBase.ts                       # [NEW] ler/salvar/excluir base de conhecimento do tenant selecionado
│   ├── useAdminIngest.ts                         # [REMOVED] substituído por useKnowledgeBase
├── services/
│   ├── pythonBackend.ts                          # [MODIFIED] + searchTenants, getKnowledgeBase, saveKnowledgeBase, deleteKnowledgeBase; − ingestKnowledge
│   ├── pythonBackend.types.ts                    # [MODIFIED] + TenantSearchResult, KnowledgeBase*; − Ingest*
│   ├── promptManager.types.ts                    # [MODIFIED] + campo is_default_prompt em TenantPromptDetail
│   ├── promptManager.ts                          # [UNCHANGED] fetchTenantPromptDetail reaproveitado sem alteração
│   └── index.ts                                  # [MODIFIED] barrel: + novos exports, − Ingest*
└── lib/
    └── tenantSchemas.ts                          # [MODIFIED] + tenantSearchSchema (termo obrigatório, mínimo 1 caractere)
```

**Structure Decision**: Estende o padrão admin existente sem criar novas rotas — toda a feature vive dentro de `AdminDashboard.tsx` (`/admin`). Serviço HTTP permanece centralizado em `src/services/pythonBackend.ts`, mesma base URL e mesmo padrão de union types já usado por `getTenantById`/`ingestKnowledge`; nenhuma nova camada de serviço é criada. `fetchTenantPromptDetail` (015, `promptManager.ts`) é reaproveitado tal como está, apenas com o tipo `TenantPromptDetail` estendido.

## Complexity Tracking

> Nenhuma violação justificada necessária — todos os gates passaram.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A (sem violações) | — | — |
