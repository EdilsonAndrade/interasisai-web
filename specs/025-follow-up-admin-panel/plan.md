# Implementation Plan: Follow-up Admin Panel

**Branch**: `025-follow-up-admin-panel` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-follow-up-admin-panel/spec.md`

## Summary

Implementar UI de administração para gerenciar rascunhos de follow-up gerados automaticamente (EDI-53), permitindo aprovação/rejeição com validação de ofertas comerciais, consulta de histórico de conversas, e configuração de ofertas por tenant. A interface será restrita a admin/CS/vendas e construída seguindo a Constitution do projeto (React Hooks, Context API, TypeScript, Tailwind, Framer Motion).

## Technical Context

**Language/Version**: TypeScript 5.x, React 18+ (Next.js 14+)  
**Primary Dependencies**: React, Next.js, React Hook Form, Zod, Framer Motion, Tailwind CSS, clsx + tailwind-merge  
**Storage**: Backend (PostgreSQL via EDI-53); frontend utiliza estado React (Context API)  
**Testing**: Jest + React Testing Library (AAA pattern)  
**Target Platform**: Web (desktop + tablet)  
**Project Type**: Web application (frontend)  
**Performance Goals**: <2s para carregar fila; <3s para histórico com 500 mensagens  
**Constraints**: Acesso restrito a admin; validação client-side de ofertas; responsividade 320px-1920px  
**Scale/Scope**: 4 user stories (fila, histórico, config, dashboard KPI); ~8-10 telas/modais; integração com 5 endpoints backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| **I. Separação Hooks/UI** | Lógica de API e estado DEVE estar em custom hooks; componentes apenas renderizam | ✅ PASS |
| **II. Context API** | Estado global (fila, histórico, filtros, config) DEVE usar Context, não Redux/Zustand | ✅ PASS |
| **III. DRY & Componentização** | Componentes reutilizáveis (botões, cards, modais) DEVEM usar clsx + tailwind-merge | ✅ PASS |
| **IV. Testes Unitários** | Hooks e componentes interativos DEVEM ter cobertura de testes Jest + RTL | ✅ PASS |
| **V. TypeScript & Erros** | Zero `any`; interfaces/types para todas props, respostas API, context; erros em toast | ✅ PASS |
| **VI. Estilização & Animação** | Tailwind-only; Framer Motion para transições; glassmorphism; <1.05 scale hover | ✅ PASS |
| **VII. SEO & Acessibilidade** | HTML semântico; ARIA labels; keyboard nav; imagens com alt (se houver) | ✅ PASS |
| **VIII. Segurança** | Sem `dangerouslySetInnerHTML`; Zod validation client-side; CSP headers verificados | ✅ PASS |

**Verdict**: ✅ **PASS** — Feature alinha com todos os 8 princípios da Constitution. Nenhuma violação identificada.

## Project Structure

### Documentation (this feature)

```text
specs/025-follow-up-admin-panel/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/admin/
├── src/
│   ├── components/
│   │   ├── follow-up/           # Follow-up queue & approval
│   │   │   ├── FollowUpQueue.tsx
│   │   │   ├── FollowUpCard.tsx
│   │   │   ├── FollowUpEditModal.tsx
│   │   │   └── FollowUpFilterBar.tsx
│   │   ├── history/              # Conversation history
│   │   │   ├── ConversationHistory.tsx
│   │   │   ├── ConversationTimeline.tsx
│   │   │   └── MessageRenderer.tsx
│   │   ├── config/               # Tenant config (offers, retention)
│   │   │   ├── TenantConfigPanel.tsx
│   │   │   └── OfferForm.tsx
│   │   ├── dashboard/            # KPI dashboard (optional)
│   │   │   ├── FollowUpDashboard.tsx
│   │   │   └── KPICard.tsx
│   │   └── shared/               # Shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ConfirmDialog.tsx
│   ├── hooks/
│   │   ├── useFollowUpQueue.ts      # Fetch & filter fila
│   │   ├── useConversationHistory.ts # Fetch histórico
│   │   ├── useTenantConfig.ts       # Fetch & update config
│   │   └── useAdminAuth.ts          # Check admin role
│   ├── context/
│   │   ├── FollowUpContext.tsx      # Follow-up fila + filtros
│   │   └── AdminAuthContext.tsx     # Admin user info
│   ├── types/
│   │   ├── followup.ts         # FollowUpQueueEntry, FilterState
│   │   ├── conversation.ts     # ConversationMessage, HistoryState
│   │   ├── tenant.ts           # TenantConfig, OfferInfo
│   │   └── api.ts              # API request/response types
│   ├── services/
│   │   └── api.ts              # API client (GET/PATCH endpoints)
│   ├── validation/
│   │   └── schemas.ts          # Zod schemas (OfferValidation, ConfigUpdate)
│   ├── utils/
│   │   ├── offerValidator.ts   # Check desconto against oferta_vigente
│   │   └── formatters.ts       # Date, status, outcome formatting
│   └── app/
│       └── admin/
│           └── follow-up/
│               ├── page.tsx     # Main page /admin/follow-up
│               └── layout.tsx   # Admin layout
└── tests/
    ├── unit/
    │   ├── hooks/
    │   ├── utils/
    │   └── validation/
    ├── integration/
    │   └── components/
    └── e2e/
        └── follow-up-flow.spec.ts
```

**Structure Decision**: Adotado "Option 2 (Web application)" — feature é frontend puro, integrada ao projeto `apps/admin` existente. Componentes seguem padrão de separação Hooks/UI (Principle I); estado global via Context (Principle II); componentes reutilizáveis com clsx+tailwind-merge (Principle III); testes cobrindo hooks e componentes (Principle IV).

## Implementation Phases

### Phase 0: Research & Decisions
- Validar endpoints backend (EDI-53) prontos
- Confirmar estrutura de Context API do projeto
- Avaliar componentes Tailwind/Framer existentes
- Definir strategy de lazy-load para históricos grandes

**Deliverable**: `research.md`

### Phase 1: Design & Contracts
- Definir data model (tipos TypeScript)
- Especificar contracts dos 5 endpoints usados
- Quickstart com setup de project
- **Deliverable**: `data-model.md`, `contracts/`, `quickstart.md`

### Phase 2: Task Breakdown
- Gerar tasks granulares por componente/hook
- Definir ordem de implementação (P1 → P2 → P3 → P4)
- **Deliverable**: `tasks.md` (via `/speckit.tasks`)
