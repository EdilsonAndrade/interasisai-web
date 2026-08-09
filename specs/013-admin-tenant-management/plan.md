# Implementation Plan: Gerenciamento Administrativo de Tenants

**Branch**: `Edilson-013-Dev` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-admin-tenant-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Adicionar `/admin/tenants` ao painel autenticado para cadastrar tenants e consultar, editar ou excluir um registro por ID, sem inventar listagem. O cliente Python existente recebe quatro operações tipadas e validação runtime; React Hook Form + Zod validam entradas; `useTenantManagement` controla concorrência, feedback e o tenant atual; componentes acessíveis cuidam de navegação, formulários e confirmação destrutiva.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16.2 (App Router)  
**Primary Dependencies**: Next.js, Tailwind CSS 3.4, Lucide React, React Hook Form 7.85, Zod 4.4  
**Storage**: Sem persistência de domínio no frontend; sessão admin em cookie `httpOnly`; tenant atual em memória  
**Testing**: Jest 30 + React Testing Library 16 com `fetch`, cookies e navegação mockados  
**Target Platform**: Web responsiva para navegadores modernos em desktop e mobile
**Project Type**: Aplicação frontend Next.js integrada à API Python  
**Performance Goals**: loading visível em até 300 ms e controles sem layout shift  
**Constraints**: sem endpoint de listagem; sem dados em logs; respostas validadas; duplicidade bloqueada; acesso administrativo obrigatório  
**Scale/Scope**: 4 operações HTTP, 1 página, 1 layout admin, 1 hook e 6 componentes de UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Verification |
|---|---|---|
| I. Separação Hook/UI | PASS | Rede e estado ficam no serviço/hook; componentes apenas renderizam e disparam ações |
| II. Context API | PASS | Estado pertence a uma única página e não exige Provider ou prop drilling profundo |
| III. DRY & Componentização | PASS | Formulário atende create/edit; diálogo e navegação são compartilhados |
| IV. Testes Unitários | PASS | Serviço, schema, hook, layout, rota e todos os componentes interativos têm testes |
| V. TypeScript & Erros | PASS | Tipos explícitos, uniões discriminadas e feedback para todas as falhas |
| VI. Identidade Visual | PASS | Tailwind, tokens e Lucide existentes, sem CSS ou dependência nova |
| VII. SEO & Acessibilidade | PASS | Metadata, semântica, labels, teclado, foco, Escape e `aria-live` |
| VIII. Segurança | PASS | Zod, ID codificado, sessão server-side e ausência de logs de tenant |

**Gate Result (Pre-Design and Post-Design)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/013-admin-tenant-management/
|-- spec.md
|-- plan.md
|-- quickstart.md
|-- checklists/requirements.md
`-- tasks.md
```

### Source Code (repository root)
```text
src/
|-- app/admin/
|   |-- layout.tsx
|   `-- tenants/page.tsx
|-- components/admin/
|   |-- AdminDialog.tsx
|   |-- AdminNavigation.tsx
|   `-- tenants/
|       |-- TenantDeleteDialog.tsx
|       |-- TenantDetails.tsx
|       |-- TenantForm.tsx
|       |-- TenantLookupForm.tsx
|       `-- TenantManagement.tsx
|-- hooks/useTenantManagement.ts
|-- lib/tenantSchemas.ts
`-- services/
    |-- pythonBackend.ts
    `-- pythonBackend.types.ts
```

**Structure Decision**: Manter o projeto Next.js único, testes colocalizados e o cliente Python existente. `src/app/admin/layout.tsx` mostra a navegação somente após validar a sessão, enquanto rotas filhas continuam responsáveis pelo redirecionamento de acesso direto. A página server-side exporta metadata e delega interação a `TenantManagement`.

## Complexity Tracking

Nenhuma violação constitucional identificada.
