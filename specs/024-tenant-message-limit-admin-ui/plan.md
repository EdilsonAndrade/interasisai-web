# Implementation Plan: Limite de mensagens por tenant — UI Admin (EDI-63)

**Branch**: `edilsonaandrade/edi-63-limite-de-mensagens-por-tenant-mensal-flag-byok-com-chave-de` | **Date**: 2026-08-25 | **Spec**: `specs/024-tenant-message-limit-admin-ui/spec.md`

**Input**: Feature specification from `/specs/024-tenant-message-limit-admin-ui/spec.md`. Backend (repo agendamento-ia, branch `edilsonaandrade/edi-63-...`) já pronto com endpoints `/tenants/{id}/usage`, `/tenants/message-limit-config`, e CRUD `/global-notification-recipients/`.

## Summary

Implementar a UI admin do EDI-63 no Next.js: estender o formulário de tenant para configurar `monthly_message_limit` (opcional) e `notification_emails` (lista), adicionar um indicador visual de consumo do mês na tela de detalhes com cores de alerta (verde/amarelo/vermelho), criar uma nova tela de "Configurações Globais" para gerenciar `global_notification_recipients`, e uma calculadora de dimensionamento de plano que estima mensagens reais a partir de chamadas de LLM. Todas as mudanças de UI consumem os endpoints reais do backend já confirmados; nenhum trabalho de backend fica aqui.

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 14.x  
**Primary Dependencies**: React 18, Next.js (App Router), React Hook Form, Zod (schema validation), Axios (via pythonBackend service), Tailwind CSS, Framer Motion  
**Storage**: N/A (estado local em forms e Context; persistência via API)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Browser (responsive web, desktop-first for admin)  
**Project Type**: Web application (SPA + SSR admin panel)  
**Performance Goals**: Form validation instant (client-side); API calls <500ms p95 (backend responsibility); indicador de consumo atualiza em <100ms  
**Constraints**: Espaço máximo no formulário de tenant já limitado; UI admin robusta a falha de rede (degradação graciosa em endpoints de leitura); sem bloqueio de form para e-mail malformado (validação client+server integrada)  
**Scale/Scope**: 3 user stories (US1 form + indicador, US2 config global, US3 calculadora); 2 telas novas/modificadas; ~1500-2000 LOC esperado (components + hooks + tests)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Separação de Responsabilidades — Hooks & UI**: 
- ✅ PASS: Toda lógica de API (fetch de usage, config, CRUD global recipients) vai em hooks dedicados (`useGetTenantUsage`, `useGetMessageLimitConfig`, `useGlobalRecipientsManager`, etc.), não em componentes.
- ✅ PASS: Componentes de form são apresentacionais (delegam validação a Zod/React Hook Form, que delegam chamadas à API para custom hooks).

**II. Gerenciamento de Estado — Context API**:
- ✅ PASS: Estado de formulário mantido em `TenantForm` via React Hook Form; estado de global recipients em `AdminGlobalRecipientsPage` (local); nada de prop-drilling.
- ⚠ CONSIDER: A calculadora de dimensionamento usa apenas estado local (inputs + derivados); não precisa de Context.

**III. Reusabilidade — DRY & Componentização**:
- ✅ PASS: Indicador de consumo é um componente reutilizável (`<TenantUsageIndicator />`), não copiar/colar em TenantDetails.
- ✅ PASS: Editor de lista de e-mails (`<EmailListEditor />`) é reutilizável caso US1 expanda no futuro (e.g., guardrails com notificações).

**IV. Testes Unitários — NON-NEGOTIABLE**:
- 🎯 REQUIRED: 100% de cobertura em hooks de fetching (`useGetTenantUsage`, etc.) com testes de sucesso/erro/degradação.
- 🎯 REQUIRED: RTL tests para componentes (form submission, validação, estado de loading, mensagens de erro).
- 🎯 REQUIRED: Testes de calculadora (arredondamento, divisão por zero, troca de cenário).
- Todos os testes seguem AAA pattern; mocks do `pythonBackend` service.

**V. Boas Práticas — TypeScript & Tratamento de Erros**:
- ✅ PASS: Estender `pythonBackend.types.ts` com `TenantUsage`, `TenantMessageLimitConfig`, `GlobalRecipient` (types concretos, sem `any`).
- ✅ PASS: Todos os erros de API refletidos em UI (toast, estado de erro no formulário, indicador degradado).

**VI. Identidade Visual — Estilização & Animação**:
- ✅ PASS: Cores de alerta (verde/amarelo/vermelho) vêm de `design-tokens.ts`, sem paleta nova.
- ✅ PASS: Animações de transição de cor no indicador via Framer Motion ou transições Tailwind (não CSS puro).

**VII. SEO, Semântica e Acessibilidade**:
- ✅ PASS: Tela de "Configurações Globais" é um subnível admin (não precisa de metadata de SEO, é interna).
- ✅ PASS: Campos de formulário com labels explícitos (`<label htmlFor="...">`) e `aria-*` onde aplicável.

**VIII. Segurança e Proteção de Dados**:
- ✅ PASS: Validação de e-mail é feita com Zod schema (`EmailStr` do Pydantic, equivalente Zod aqui).
- ✅ PASS: Sem `dangerouslySetInnerHTML` em lista de e-mails ou qualquer dado dinâmico.

---

**GATE RESULT**: ✅ PASS ALL — nenhuma violação. Proceder para Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/024-tenant-message-limit-admin-ui/
├── spec.md              ✅ Complete
├── plan.md              👈 This file
├── research.md          📋 Phase 0 (TBD)
├── data-model.md        📋 Phase 1 (TBD)
├── contracts/           📋 Phase 1 (TBD)
└── quickstart.md        📋 Phase 1 (TBD)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── tenantSchemas.ts                     # Extend: TenantWriteInput += monthly_message_limit + notification_emails
│   ├── tenantUsageSchemas.ts                # NEW: Zod schemas for TenantUsage, TenantMessageLimitConfig
│   └── globalRecipientsSchemas.ts           # NEW: Zod schemas for GlobalRecipient CRUD
│
├── services/
│   ├── pythonBackend.types.ts               # Extend: add Tenant[Usage|MessageLimitConfig], GlobalRecipient[*] types
│   ├── pythonBackend.ts                     # Extend: add API methods for GET /tenants/{id}/usage, GET /tenants/message-limit-config, CRUD /global-notification-recipients/
│   └── pythonBackend.tenants.test.ts        # Extend with new API method tests
│
├── hooks/
│   ├── useTenantUsage.ts                    # NEW: Custom hook — GET /tenants/{id}/usage + error handling + degradation
│   ├── useTenantUsage.test.ts               # NEW: Unit tests (success, error, null limit)
│   ├── useMessageLimitConfig.ts             # NEW: Custom hook — GET /tenants/message-limit-config (cached for calculadora + campo dica)
│   ├── useMessageLimitConfig.test.ts        # NEW: Unit tests
│   ├── useGlobalRecipientsManager.ts        # NEW: Custom hook — CRUD /global-notification-recipients/ + error handling
│   └── useGlobalRecipientsManager.test.ts   # NEW: Unit tests (list, create, update, delete, duplicate handling)
│
├── components/
│   └── admin/
│       └── tenants/
│           ├── TenantForm.tsx               # Extend: add fields monthly_message_limit + notification_emails + email list editor
│           ├── TenantForm.test.tsx          # Extend: tests for new fields (validation, persistence)
│           ├── TenantDetails.tsx            # Extend: add TenantUsageIndicator component at the top
│           ├── TenantDetails.test.tsx       # Extend: tests for usage display (no-limit state, error state)
│           ├── TenantUsageIndicator.tsx     # NEW: Reusable component — displays usage with color coding + percentage
│           ├── TenantUsageIndicator.test.tsx# NEW: Tests for color states (green/yellow/red), no-limit state
│           ├── EmailListEditor.tsx          # NEW: Reusable component — add/remove e-mails from a list
│           ├── EmailListEditor.test.tsx     # NEW: Tests (add, remove, validation, duplicate rejection)
│           ├── GlobalNotificationRecipients.tsx  # NEW: Tela/section of Configurações Globais — CRUD UI
│           └── GlobalNotificationRecipients.test.tsx # NEW: RTL tests (list, create, update, delete, 409 handling)
│
└── app/
    └── [locale]
        └── admin/
            ├── layout.tsx                   # Extend: AdminNavigation includes link to Configurações Globais
            └── global-settings/
                └── page.tsx                 # NEW: "Configurações Globais" page (with GlobalNotificationRecipients + plan calculator)
```

**Structure Decision**: Single Next.js project (no split backend/frontend in this repo). Admin pages live under `app/[locale]/admin/`. Custom hooks in `hooks/` for API + stateful logic. Reusable UI components in `components/admin/tenants/` (thematic grouping, não por camada arquitetônica).

## Dependencies & Integration Points

### Backend Contracts (Already Confirmed)

1. **Tenant Create/Update**: `POST /tenants/`, `PUT /tenants/{id}` aceitam/devolvem `monthly_message_limit: int | null`, `notification_emails: string[]`
2. **Tenant Usage**: `GET /tenants/{id}/usage` → `{ tenant_id, monthly_message_limit, current_month_calls, percentage_used, blocked }`
3. **Message Limit Config**: `GET /tenants/message-limit-config` → `{ worst_case_calls_per_message, average_calls_per_message }`
4. **Global Recipients CRUD**: `GET/POST/PUT/DELETE /global-notification-recipients/` → `{ id, email, active, created_at }`

### No New Backend Work Required

- O backend já implementa todos os endpoints.
- Esta feature consome exclusivamente esses endpoints.
- Qualquer divergência encontrada (campo extra, formato diferente) deve ser validada contra o código real do backend e comunicada, não contra esta spec.

## Key Unknowns & Phase 0 Research Tasks

(None identified at this point — context é bem-definido pelos endpoints reais do backend já prontos. Nenhuma "NEEDS CLARIFICATION" enumerada na spec. Proceder direto para Phase 1: design.)

## Phase 1: Design — Artifacts to Generate

1. **data-model.md**: Entity relationships (Tenant → TenantUsage, GlobalRecipient), validation rules, state transitions (form pristine → dirty → submitting → success/error).
2. **contracts/**: Interface contracts for new custom hooks (return types, error handling patterns), schema contracts para mensagens de e-mail.
3. **quickstart.md**: Dev environment setup, como testar as novas telas (criar tenant com limite, chamar GET /usage fake, etc.), como rodar tests.

## Complexity Justification

(No violations to justify — constitution check passou sem conflitos.)

---

## Next Steps

1. ✅ **This step (Plan)**: Create plan.md — DONE
2. 📋 **Phase 0 (Research)**: Nenhuma research necessária — backend já está pronto. Passar direto para Phase 1.
3. 📋 **Phase 1 (Design)**: Generate data-model.md, contracts/, quickstart.md com detalhes de implementação — próximo passo: `/speckit-plan` workflow ou manual execution de Phase 1
4. 📋 **Phase 2 (Tasks)**: Rodar `/speckit-tasks` ou gerar tasks.md manualmente com lista de T001-T0NN seguindo as stories.
5. 📋 **Phase 3 (Implementation)**: Rodar `/speckit-implement` ou trabalhar diretamente no código seguindo tasks.md.

---

**Status**: Plan complete. Branch ready for Phase 0 research / Phase 1 design execution.
