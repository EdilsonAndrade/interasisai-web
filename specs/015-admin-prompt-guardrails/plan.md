# Implementation Plan: Administração de Prompts e Guardrails

**Branch**: `015-admin-prompt-guardrails` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-admin-prompt-guardrails/spec.md`

## Summary

Adicionar à área administrativa uma página de gerenciamento de Prompts e Guardrails estruturada em 3 abas (Prompts Base, Guardrails, Vincular Tenant). A implementação segue o padrão admin existente (server component → client component delegation, auth guard via session cookie), adiciona `sonner` para notificações toast, constrói um editor Markdown customizado (textarea + `react-markdown` com `rehype-sanitize` para preview com três modos), e implementa Tabs, Checkbox (seleção N:N de guardrails em prompts), e Modal/Dialog customizados usando os padrões visuais do projeto (Tailwind design tokens, glassmorphism, framer-motion, `clsx` + `tailwind-merge`). A camada de serviço centraliza chamadas à API Python backend em `src/services/promptManager.ts` seguindo o padrão de union types (`{ ok, status }`) já estabelecido em `pythonBackend.ts`.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.2.4, React 19.2.4
**Primary Dependencies**: react-hook-form 7.85 + zod 4.4 + @hookform/resolvers 5.7, react-markdown 10.1 + rehype-sanitize, framer-motion 12.38, tailwindcss 3.x, clsx 2.1 + tailwind-merge 3.5, lucide-react 1.8, sonner 2.x (novo — toast notifications), next-intl 4.13
**Storage**: N/A (dados persistidos no backend Python/FastAPI; frontend apenas consome APIs REST)
**Testing**: Fora do escopo desta feature (user explicitly requested no unit tests for now)
**Target Platform**: Browser (desktop + mobile), renderizado via Next.js Server Components com ilhas de interatividade ("use client")
**Project Type**: Web application (Next.js App Router, single frontend project)
**Performance Goals**: Alternância entre modos do editor Markdown < 500ms; feedback toast < 1s após resposta API; sem regressão no Lighthouse score
**Constraints**: Seguir padrão admin existente (server component → client delegation, session cookie, union types para API); biblioteca de componentes inexistente — todos os componentes são custom; compatível com Dockerfile e CSP headers existentes; zod v4 (API de `.required()` em vez de `.nonempty()`)
**Scale/Scope**: 3 abas, 6 componentes principais, 1 serviço, 1 arquivo de tipos, ~9 endpoints REST consumidos; sem novas rotas de API Next.js

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| I. Hook/UI Separation | ✅ PASS | Componentes "dumb" delegam lógica para hooks: `useGuardrails`, `usePrompts`, `useTenantLink`. API calls centralizadas em `promptManagerService.ts`. Nenhum `fetch` direto em `.tsx`. |
| II. Context API (State) | ✅ PASS | Estado local via `useState`/`useReducer` nos hooks — suficiente para escopo de tela única. Sem necessidade de Context global novo. |
| III. DRY & Componentização | ✅ PASS | `MarkdownEditorCustom` reutilizado em 3 lugares (PromptFormModal, GuardrailFormModal, TenantLinkSection). `AdminDialog` reutilizado para modais. Componentes atômicos: Tabs, Checkbox. |
| IV. Testes Unitários | ⚠️ N/A | Fora do escopo por solicitação explícita do usuário ("não inclua testes unitários neste caso por hora"). Nenhum teste será gerado nesta entrega. |
| V. TypeScript & Erros | ✅ PASS | `any` proibido. Tipos centralizados em `src/components/admin/prompt-manager/types.ts`. Union types para sucesso/falha da API. Erros de rede capturados e exibidos via toast. |
| VI. Identidade Visual | ✅ PASS | Tailwind-only, glassmorphism com `backdrop-blur`, `rounded-card`, design tokens do tema (`bg-surface-base`, `border-brand-primary`, `text-text-strong`). Animações via framer-motion com `easeOut`. Hover scale ≤ 1.05. Glow via `shadow-[...]`. |
| VII. SEO & Acessibilidade | ✅ PASS | `metadata` export no `page.tsx`. HTML semântico (`<main>`, `<nav>` de tabs, `<dialog>` para modais). `aria-live` para feedback inline. Labels em todos os campos. Navegação por teclado. |
| VIII. Segurança | ✅ PASS | `dangerouslySetInnerHTML` proibido. Markdown renderizado via `react-markdown` com `rehype-sanitize` (DOMPurify-like). Validação Zod em todos os formulários. Nenhuma secret em `NEXT_PUBLIC_`. CSP headers mantidos. |

**Result**: ALL GATES PASS (Testes N/A por escopo). Nenhuma violação. Complexidade justificada no tracking.

## Project Structure

### Documentation (this feature)

```text
specs/015-admin-prompt-guardrails/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md # API contracts documentation
└── tasks.md             # Phase 2 output (future /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── [locale]/
│       └── admin/
│           └── prompt-manager/
│               └── page.tsx                    # Server component: auth guard + metadata
├── components/
│   └── admin/
│       ├── AdminDialog.tsx                      # [EXISTING] Reusable modal dialog
│       ├── AdminNavigation.tsx                  # [MODIFIED] Add nav item
│       └── prompt-manager/
│           ├── PromptManagerPage.tsx            # Client orchestrator: tabs + state
│           ├── PromptList.tsx                   # Lista de prompts + ações
│           ├── PromptFormModal.tsx              # Modal create/edit prompt + editor + N:N guardrails
│           ├── GuardrailList.tsx                # Lista de guardrails + ações
│           ├── GuardrailFormModal.tsx           # Modal create/edit guardrail + editor
│           ├── TenantLinkSection.tsx            # Form vinculação tenant-prompt
│           ├── MarkdownEditorCustom.tsx         # Editor 3 modos (edit/preview/split)
│           ├── Tabs.tsx                         # Componente de abas reutilizável
│           └── types.ts                         # Tipos e schemas Zod
├── services/
│   ├── promptManager.ts                         # Serviço de API (fetch wrapper)
│   └── promptManager.types.ts                   # Tipos de API (request/response)
├── lib/
│   └── promptManagerSchemas.ts                  # Zod schemas + tipos inferidos
└── hooks/
    ├── useGuardrails.ts                         # Hook: CRUD guardrails
    ├── usePrompts.ts                            # Hook: CRUD prompts + N:N guardrails
    └── useTenantLink.ts                         # Hook: vínculo tenant-prompt
```

**Structure Decision**: Padrão web app existente — `src/app/[locale]/admin/*` para rotas, `src/components/admin/*` para componentes visuais, `src/services/*` para API, `src/lib/*` para schemas Zod, `src/hooks/*` para hooks (novo diretório, conforme Constitution I exige separação de lógica).

## Complexity Tracking

> Nenhuma violação justificada necessária — todos os gates passaram.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A (sem violações) | — | — |
