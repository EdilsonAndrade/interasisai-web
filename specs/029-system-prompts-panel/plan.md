# Implementation Plan: Painel Admin — Prompts do Sistema (versionamento e rollback)

**Branch**: `edilsonaandrade/edi-71-painel-admin-gerenciar-prompts-do-sistema-hardcoded-no` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/029-system-prompts-panel/spec.md`

## Summary

Transformar o item "Painel" da navegação administrativa em um menu com dois submenus — "Prompts do Sistema" (nova tela) e "Ingestão Tenant" (rota `/admin` existente, comportamento inalterado). A nova tela em `/admin/system-prompts` lista os 4 prompts hoje hardcoded em `modules/ia/agent_graph.py` (routing_agent, GROUNDEDNESS_RULE, CHITCHAT_NO_KNOWLEDGE_RULE, BOOKING_INTEGRITY_RULE), permite editar o conteúdo vigente (salvando via `PUT`, que move a versão anterior para `last_version`) e reverter para a versão anterior via `POST /rollback` (operação reversível: current_version ↔ last_version). Backend já pronto (`/api/v1/system-prompts`); a implementação é apenas frontend, seguindo o mesmo padrão arquitetural já usado em `015-admin-prompt-guardrails` (server component com auth guard → client orchestrator, hooks para lógica, serviço de API com union types, toast via `sonner`).

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.2.4, React 19.2.4
**Primary Dependencies**: sonner 2.x (toast, já em uso), clsx 2.1 + tailwind-merge 3.5, lucide-react 1.8, framer-motion 12.38, next-intl 4.13. Não requer react-markdown/rehype-sanitize (conteúdo de prompt é texto plano em textarea, sem preview Markdown).
**Storage**: N/A (dados persistidos no backend Python/FastAPI via `NEXT_PUBLIC_PYTHON_BACKEND_URL`; frontend apenas consome REST).
**Testing**: Jest + React Testing Library (Constitution IV é NON-NEGOTIABLE neste projeto — diferente da feature 015, aqui não há dispensa explícita do usuário). Hooks testados com `renderHook`; componentes interativos testados com RTL (`getByRole`, `getByLabelText`).
**Target Platform**: Browser (desktop + mobile), Next.js App Router com Server Components + ilhas "use client".
**Project Type**: Web application (Next.js App Router, projeto frontend único).
**Performance Goals**: Feedback de toast em até 1s após resposta da API (SC-004); ação de reverter concluída em até 30s incluindo confirmação (SC-003).
**Constraints**: Reutilizar auth guard de sessão admin (cookie `ADMIN_SESSION_COOKIE`) igual às demais rotas `/admin/*`; reutilizar `AdminDialog` para confirmação de rollback; nenhuma rota ou comportamento da página `/admin` (Ingestão Tenant) pode mudar; não logar conteúdo de prompts (apenas `prompt_key`/status).
**Scale/Scope**: 1 rota nova, conjunto fixo de 4 prompts (sem paginação), 1 serviço de API, ~4 endpoints REST consumidos, 1 modificação em componente de navegação existente.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| I. Hook/UI Separation | ✅ PASS | Lógica de listagem/salvar/reverter isolada em `useSystemPrompts.ts`. Componentes `.tsx` apenas consomem estado/ações do hook. Nenhum `fetch` direto em componente. |
| II. Context API (State) | ✅ PASS | Estado local via `useState` no hook — escopo de tela única, sem necessidade de Context global. |
| III. DRY & Componentização | ✅ PASS | Reutiliza `AdminDialog` (confirmação de rollback) e `AdminNavigation` (estendido, não duplicado). Novo `SystemPromptEditor` isolado e reutilizável entre os 4 prompts. |
| IV. Testes Unitários | ✅ PASS (planejado) | `useSystemPrompts.test.ts` (renderHook, cobre sucesso/erro de list/save/rollback) + RTL para `SystemPromptList`/`SystemPromptEditor` (clique, edição, confirmação). `promptManager`-style service mockado via `jest.mock`. |
| V. TypeScript & Erros | ✅ PASS | `any` proibido; tipos em `src/services/systemPrompts.types.ts`. Union type `{ ok, status }` para respostas, igual ao padrão de `promptManager.ts`. Erros de rede/validação exibidos via toast. |
| VI. Identidade Visual | ✅ PASS | Tailwind-only, reaproveita tokens (`bg-surface-base`, `rounded-card`, `border-border-subtle`) e padrões de glassmorphism já usados no admin. Hover scale ≤ 1.05. |
| VII. SEO & Acessibilidade | ✅ PASS | `metadata` export em `page.tsx`. HTML semântico (`<main>`, `<ul>`/`<nav>` para submenu). Labels em textarea. Confirmação de rollback anunciada via `aria-live`/toast. |
| VIII. Segurança | ✅ PASS | Sem `dangerouslySetInnerHTML` (conteúdo é texto plano, não Markdown renderizado). Sem novas secrets — reutiliza `NEXT_PUBLIC_PYTHON_BACKEND_URL` já existente. Conteúdo de prompt nunca vai a `console.error`/logs (apenas `prompt_key` e status HTTP). |

**Result**: ALL GATES PASS. Nenhuma violação — sem necessidade de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/029-system-prompts-panel/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api-contracts.md # API contracts documentation (backend já pronto — apenas referência)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── [locale]/
│       └── admin/
│           └── system-prompts/
│               └── page.tsx                    # Server component: auth guard + metadata
├── components/
│   └── admin/
│       ├── AdminDialog.tsx                      # [EXISTING] Reutilizado para confirmação de rollback
│       ├── AdminNavigation.tsx                  # [MODIFIED] "Painel" vira menu com submenus
│       └── system-prompts/
│           ├── SystemPromptsPage.tsx            # Client orchestrator: lista + seleção + estado
│           ├── SystemPromptList.tsx             # Lista os 4 prompts com título de origem
│           ├── SystemPromptEditor.tsx           # Textarea editável + ações salvar/reverter
│           └── types.ts                         # Tipos locais de componentes
├── services/
│   ├── systemPrompts.ts                         # Serviço de API (fetch wrapper, union types)
│   └── systemPrompts.types.ts                   # Tipos de API (request/response)
└── hooks/
    └── useSystemPrompts.ts                      # Hook: listar, selecionar, salvar, reverter

tests/ (ou src/**/*.test.ts(x) conforme convenção Jest do projeto)
├── hooks/useSystemPrompts.test.ts
├── components/admin/system-prompts/SystemPromptList.test.tsx
└── components/admin/system-prompts/SystemPromptEditor.test.tsx
```

**Structure Decision**: Segue exatamente o padrão da feature `015-admin-prompt-guardrails` já validado neste repositório — `src/app/[locale]/admin/*` para rota, `src/components/admin/*` para UI, `src/services/*` para API, `src/hooks/*` para lógica. Não introduz Tabs/Modal/N:N (fora de escopo aqui); reduz superfície reutilizando `AdminDialog` já existente ao invés de um novo componente de modal.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Nenhuma violação — todos os gates passaram.
