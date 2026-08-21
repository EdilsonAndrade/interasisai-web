# Implementation Plan: Ajustes de Usabilidade no Painel Administrativo (Fase 1)

**Branch**: `019-admin-ux-quick-wins` | **Date**: 2026-08-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-admin-ux-quick-wins/spec.md`

## Summary

Sete ajustes pontuais de usabilidade no painel administrativo, sem mudança de contrato de API ou de dados persistidos. O achado central é que `AdminDialog` — componente único usado pelos ~8 modais do admin — nunca chama `dialogRef.current.showModal()`, apenas renderiza o atributo `open`; por isso ESC, backdrop e *focus containment* nativos do `<dialog>` estão silenciosamente desativados hoje (e o teste atual dá falso positivo por disparar o evento `cancel` manualmente). Corrigir isso de uma vez resolve US1 para todos os modais. As demais mudanças são: copy do título da tela "Painel" (US2); dois componentes novos e reutilizáveis — `DeleteAction` (US3) e `GuardrailScopeBadge` (US6) — que substituem 4 implementações duplicadas cada; busca client-side em Prompts Base (US4); diferenciador de nó/id para prompts com título repetido, reaproveitando a badge de nó já existente (US5); e correção de copy no campo "Atualizado em" (US7).

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.2.4, React 19.2.4
**Primary Dependencies**: react-hook-form 7.85 + zod 4.4 (`@hookform/resolvers` 5.7), lucide-react 1.8, sonner 2.x — todas já presentes; nenhuma dependência nova
**Storage**: N/A (frontend apenas consome APIs REST já existentes; nenhum endpoint novo ou alterado)
**Testing**: Jest 30 + React Testing Library (Constitution IV) — inclui reescrita de `AdminDialog.test.tsx` para exercitar ESC real via `showModal()`, hoje mascarado por um `fireEvent` sintético
**Target Platform**: Browser (desktop + mobile), Next.js App Router, componentes client (`"use client"`)
**Project Type**: Web application (Next.js, single frontend project) — ajustes pontuais em telas existentes (`013-admin-tenant-management`, `015-admin-prompt-guardrails`, `018-guardrail-node-targets`)
**Performance Goals**: Sem meta de performance nova; filtro de Prompts Base é client-side sobre lista já carregada em memória (dezenas de itens)
**Constraints**: Não regredir o fluxo de confirmação de exclusão já existente em nenhum dos 4 pontos; correção de `AdminDialog` deve manter compatibilidade com todos os call sites atuais (props existentes inalteradas, apenas aditivas)
**Scale/Scope**: 1 correção estrutural (`AdminDialog`) que beneficia ~8 modais; 2 componentes novos reutilizáveis (`DeleteAction`, `GuardrailScopeBadge`) substituindo 4 implementações duplicadas cada; 1 filtro client-side; 1 diferenciador de título duplicado; 2 correções de copy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| I. Hook/UI Separation | ✅ PASS | Filtro de busca é `useState` local + `.filter()` derivado (comportamento de UI, não lógica de negócio); dirty-tracking reaproveita `formState.isDirty` do `react-hook-form` já existente — nenhuma lógica nova fora de hooks/forms. |
| II. Context API (State) | ✅ PASS | Nenhum estado global novo; `query` de busca e `pendingDiscardConfirm` são estado local de componente único (permitido pela Principle II). |
| III. DRY & Componentização | ✅ PASS | `DeleteAction` e `GuardrailScopeBadge` **reduzem** duplicação existente (4 implementações ad-hoc cada → 1 componente cada), em vez de introduzir nova. Confirmação de descarte implementada uma vez em `AdminDialog`, reutilizada por todos os modais de formulário. |
| IV. Testes Unitários | ✅ PASS | `AdminDialog.test.tsx` reescrito (ESC real via `showModal()` + fluxo de descarte); novos testes para `DeleteAction`, `GuardrailScopeBadge`, filtro de `PromptList`, diferenciador de título duplicado, `TenantDetails` (copy de "Atualizado em") e `AdminDashboard` (título). |
| V. TypeScript & Erros | ✅ PASS | `any` proibido; `hasUnsavedChanges?: boolean` e `onDirtyChange?: (dirty: boolean) => void` como props tipadas explícitas; nenhum tipo de entidade persistida muda. |
| VI. Identidade Visual | ✅ PASS | Apenas Tailwind (sem CSS novo); `GuardrailScopeBadge` introduz um tooltip acessível construído com Tailwind + `aria-describedby` (sem lib nova, já que nenhum componente de tooltip existe no projeto hoje). |
| VII. SEO & Acessibilidade | ✅ PASS | Corrigir `showModal()` é uma melhoria de acessibilidade (focus trap nativo + ESC), não apenas um requisito funcional; tooltip da badge funciona por foco de teclado, não só hover. |
| VIII. Segurança | ✅ PASS | Nenhum input novo além dos já validados por Zod; busca é filtro client-side sem novo endpoint; nenhuma mudança em CSP, secrets ou `dangerouslySetInnerHTML`. |

**Result**: ALL GATES PASS. Nenhuma violação.

## Project Structure

### Documentation (this feature)

```text
specs/019-admin-ux-quick-wins/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit.tasks — not created by /speckit.plan)
```

Sem `contracts/`: feature é puramente de frontend, sem endpoint novo ou alterado.

### Source Code (repository root)

```text
src/
├── components/
│   └── admin/
│       ├── AdminDialog.tsx                     # [MODIFIED] showModal()/close() reais + prop hasUnsavedChanges + confirmação de descarte + área de clique do "X"
│       ├── AdminDialog.test.tsx                # [MODIFIED] ESC real via showModal(), fluxo de descarte
│       ├── AdminDashboard.tsx                  # [MODIFIED] título da tela "Painel"
│       ├── AdminDashboard.test.tsx             # [MODIFIED] assert do novo título
│       ├── DeleteAction.tsx                    # [NEW] botão "Excluir" discreto reutilizável
│       ├── DeleteAction.test.tsx               # [NEW]
│       ├── GuardrailScopeBadge.tsx              # [NEW] badge "Global" + tooltip acessível, rótulo único
│       ├── GuardrailScopeBadge.test.tsx         # [NEW]
│       ├── KnowledgeBaseEditor.tsx              # [MODIFIED] usa DeleteAction
│       ├── tenants/
│       │   ├── TenantDetails.tsx                # [MODIFIED] usa DeleteAction; copy "Nunca atualizado"
│       │   ├── TenantDetails.test.tsx           # [MODIFIED]
│       │   ├── TenantForm.tsx                   # [MODIFIED] + prop onDirtyChange
│       │   ├── TenantForm.test.tsx              # [MODIFIED]
│       │   └── TenantManagement.tsx             # [MODIFIED] repassa hasUnsavedChanges ao AdminDialog
│       └── prompt-manager/
│           ├── PromptList.tsx                   # [MODIFIED] busca client-side, DeleteAction, diferenciador de título duplicado
│           ├── PromptList.test.tsx              # [MODIFIED]
│           ├── GuardrailList.tsx                # [MODIFIED] usa DeleteAction e GuardrailScopeBadge
│           ├── GuardrailList.test.tsx           # [MODIFIED]
│           ├── PromptFormModal.tsx               # [MODIFIED] repassa formState.isDirty; usa GuardrailScopeBadge na lista de guardrails
│           ├── GuardrailFormModal.tsx            # [MODIFIED] repassa formState.isDirty
│           └── TenantLinkSection.tsx             # [MODIFIED] usa GuardrailScopeBadge
```

**Structure Decision**: Ajustes pontuais dentro das features existentes `013-admin-tenant-management`, `015-admin-prompt-guardrails` e `018-guardrail-node-targets` — nenhum diretório, rota ou hook novo além dos dois componentes de apresentação (`DeleteAction`, `GuardrailScopeBadge`), que vivem em `src/components/admin/` por serem específicos do admin (não candidatos a `src/components/ui/` genérico neste momento).

## Complexity Tracking

> Nenhuma violação justificada necessária — todos os gates passaram.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A (sem violações) | — | — |
