# Implementation Plan: Placeholders obrigatórios por tipo de prompt + validação ao salvar

**Branch**: `026-prompt-type-placeholders` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/026-prompt-type-placeholders/spec.md`

## Summary

Exibir na tela de criação/edição de prompt somente os placeholders obrigatórios do `node_type` selecionado (operational: 6; institutional: 4; chitchat: 1), validar ao salvar se todos estão presentes no conteúdo e, se não estiverem, alertar o administrador com a escolha entre "Corrigir" e "Salvar mesmo assim" — inclusive na "Customização de Conteúdo" da tela "Vincular Tenant". Ao trocar o "Nó de Destino", a dica de placeholders e a seção de guardrails se atualizam em sincronia com o novo tipo. Tudo frontend-only: validação pura em `src/lib/`, alerta reutilizável no padrão `AdminDialog`, sem mudanças de API/contrato.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React 19.2, Next.js 16.2 (App Router)
**Primary Dependencies**: react-hook-form 7 + zod 4, Tailwind CSS 3.4, lucide-react, sonner, clsx + tailwind-merge
**Storage**: N/A — nenhuma persistência nova; mapa estático em código; API do prompt-manager inalterada
**Testing**: Jest 30 + React Testing Library (+ jest-dom), padrão AAA, mocks de API
**Target Platform**: Web (painel administrativo desktop)
**Project Type**: Next.js web app (módulo admin `prompt-manager`)
**Performance Goals**: validação O(placeholders × texto) no clique de salvar — irrelevante (< 1 ms para textos de prompt)
**Constraints**: sem mudança de contrato de API; aviso não bloqueante (sem regra impeditiva no backend); strings em PT no padrão do módulo; Tailwind apenas; a11y com `role="alertdialog"`
**Scale/Scope**: 3 node types; até 7 placeholders por tipo; 2 telas (Prompts Base, Vincular Tenant); 1 componente novo reutilizável

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidência |
|---|---|---|
| I. Hooks & UI separation | PASS | Lógica de validação pura em `src/lib/promptPlaceholders.ts`; componentes só consomem e renderizam. Estado do alerta é local de tela (padrão `AdminDialog`) |
| II. Context API | PASS | Nenhum estado global novo; `useState` local para o alerta |
| III. DRY & componentização | PASS | Fonte única do mapa de placeholders; `MissingPlaceholdersAlert` compartilhado entre os dois modais |
| IV. Testes unitários | PASS (planejado) | Testes unitários das funções puras + RTL com interações reais (submit, troca de select, cliques) em `PromptFormModal`, `TenantLinkSection`, `MissingPlaceholdersAlert`, `PromptPlaceholderHelp` |
| V. TypeScript & erros | PASS | Interfaces tipadas novas (`MissingPlaceholdersAlertProps`); nenhum `any`; falhas continuam em toasts/erros como hoje |
| VI. Identidade visual | PASS | Tailwind somente, tokens existentes (`rounded-card`, `bg-surface-base`, `text-amber-300`/`text-red-400`), sem inline styles |
| VII. SEO, semântica e acessibilidade | PASS | `role="alertdialog"`, `aria-label`, lista semântica dos tokens ausentes, foco inicial no botão seguro (padrão `AdminDialog`) |
| VIII. Segurança | PASS | Sem `dangerouslySetInnerHTML`; sem novos inputs além dos já validados por zod; sem segredos |

Re-check pós-design (Phase 1): **mantém PASS** — nenhuma decisão de design introduziu lógica em `.tsx`, estado global, duplicação ou violação visual/a11y.

## Project Structure

### Documentation (this feature)

```text
specs/026-prompt-type-placeholders/
├── plan.md              # This file
├── research.md          # Phase 0 output (R1..R6)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── placeholder-validation.md   # Phase 1 output (contratos UI/função)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── promptPlaceholders.ts               # NOVO — mapa estático + requiredPlaceholdersFor + missingRequiredPlaceholders
│   ├── promptPlaceholders.test.ts          # NOVO — testes unitários das funções puras
│   └── promptContent.ts                    # mantido (PromptSelectField, fluxo de cadastro de tenant — fora de escopo)
├── components/admin/prompt-manager/
│   ├── promptPlaceholderHelp.ts            # REMOVIDO — mapa movido para src/lib (imports atualizados)
│   ├── PromptPlaceholderHelp.tsx           # filtra somente obrigatórios; importa da lib
│   ├── PromptPlaceholderHelp.test.tsx      # ajustes de import + cenários "somente obrigatórios"
│   ├── MissingPlaceholdersAlert.tsx        # NOVO — overlay role="alertdialog" reutilizável
│   ├── MissingPlaceholdersAlert.test.tsx   # NOVO — RTL das ações e conteúdo
│   ├── PromptFormModal.tsx                 # validação no submit + alerta + refresh de guardrails na troca de tipo
│   ├── PromptFormModal.test.tsx            # novos cenários
│   ├── TenantLinkSection.tsx               # validação do override no submit + alerta
│   └── TenantLinkSection.test.tsx          # novos cenários de override
└── services/
    └── promptManager*.ts                   # inalterado (sem mudança de contrato)
```

**Structure Decision**: mantém a estrutura existente do módulo admin (`components/admin/prompt-manager/`, `src/lib/`, `src/services/`). Única realocação: o mapa estático sai de components para `src/lib/promptPlaceholders.ts`, pois passa a ser consumido também pela validação (dependência correta: lib não importa de components).

## Complexity Tracking

> Sem violações de constitution — nenhuma justificativa necessária.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| — | — | — |
