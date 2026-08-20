# Implementation Plan: Prompts e Guardrails por Nó (Operational/Institutional/Chitchat)

**Branch**: `edilsonaandrade/edi-42-permitir-associar-guardrails-ao-chitchat_node` | **Date**: 2026-08-20 (revisado) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-guardrail-node-targets/spec.md`

## Summary

Adicionar `node_type` (`operational` | `institutional` | `chitchat`) ao `Prompt`, espelhando o modelo real
implementado no backend (`agendamento-ia`, `specs/003-guardrails-por-no/`). A associação de guardrails a um
nó passa a ser simplesmente vincular o guardrail ao prompt daquele nó — reaproveitando 100% o seletor N:N de
guardrails já existente em `PromptFormModal`, sem nenhuma mudança no `Guardrail`. `PromptFormModal` ganha um
seletor "Nó de Destino"; `PromptList` ganha um badge de nó; `TenantLinkSection` ganha um seletor de nó (3
abas) que filtra os prompts disponíveis e é repassado à API (`GET /tenant/{id}?node_type=...`), já que cada
tenant passa a ter até 3 vínculos ativos independentes. Um achado incidental foi corrigido no mesmo tipo:
`TenantPromptDetail.prompt_conteudo_base`/`prompt_is_default` nunca correspondiam ao contrato real do backend
(`prompt_conteudo`/`is_default_prompt`).

**Nota de processo**: a primeira versão desta feature (campo `nodes: NodeType[]` no `Guardrail`) foi
implementada e depois **revertida** após constatar que o backend real já havia adotado um modelo diferente,
mais simples e testado (`node_type` no `Prompt`). Ver `research.md` para o raciocínio completo.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.2.4, React 19.2.4
**Primary Dependencies**: react-hook-form 7.85 + zod 4.4 + @hookform/resolvers 5.7, lucide-react 1.8, sonner 2.x — todas já presentes; nenhuma dependência nova
**Storage**: N/A (dados persistidos no backend Python/FastAPI; frontend apenas consome APIs REST)
**Testing**: Jest + React Testing Library (Constitution IV) — cobertura para `node_type` no schema, no `PromptFormModal`, no `TenantLinkSection` e no query param de `fetchTenantPromptDetail`
**Target Platform**: Browser (desktop + mobile), Next.js App Router, componentes client (`"use client"`)
**Project Type**: Web application (Next.js, single frontend project) — extensão de feature existente (015-admin-prompt-guardrails)
**Performance Goals**: Sem impacto perceptível; campo adicional em formulários e filtro client-side já existentes
**Constraints**: Contrato alinhado com o backend real (`agendamento-ia`, spec 003, 27/29 tarefas concluídas) — não é uma proposta especulativa
**Scale/Scope**: 1 campo novo de entidade (`Prompt.node_type`), 1 campo renomeado/corrigido (`TenantPromptDetail`), 1 seletor de UI em `PromptFormModal`, 1 badge em `PromptList`, 1 seletor de nó em `TenantLinkSection` — sem novas rotas, hooks ou tabelas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| I. Hook/UI Separation | ✅ PASS | `PromptFormModal`/`TenantLinkSection` continuam "dumb"; lógica de node_type em `useForm`/props, chamadas de API em `promptManager.ts`/`useTenantLink.ts`. |
| II. Context API (State) | ✅ PASS | `selectedNode` é estado local (`useState`) do `TenantLinkSection`, escopo de tela única — sem necessidade de Context novo. |
| III. DRY & Componentização | ✅ PASS | Seletor de nó em `TenantLinkSection` reaproveita o padrão visual de abas já usado em `MarkdownEditorCustom`/`PromptManagerPage`. Nenhum componente duplicado. |
| IV. Testes Unitários | ✅ PASS | `PromptFormModal.test.tsx` (3 testes), `TenantLinkSection.test.tsx` (5 testes), `promptManagerSchemas.test.ts` (5 testes), `promptManager.test.ts` (2 testes) — todos cobrindo o comportamento novo. |
| V. TypeScript & Erros | ✅ PASS | `NodeType` como union type explícito; `any` proibido; `tsc --noEmit` sem novos erros. |
| VI. Identidade Visual | ✅ PASS | Reaproveita padrão de abas/select já existente (Tailwind, sem CSS novo). |
| VII. SEO & Acessibilidade | ✅ PASS | `<select>` com `<label>` associado para "Nó de Destino"; `role="group"`/`aria-pressed` no seletor de abas do `TenantLinkSection` (mesmo padrão do `MarkdownEditorCustom`). |
| VIII. Segurança | ✅ PASS | Sem novo input de texto livre; `node_type` validado por enum no Zod. Nenhuma mudança em CSP, secrets ou `dangerouslySetInnerHTML`. |

**Result**: ALL GATES PASS. Nenhuma violação.

## Project Structure

### Documentation (this feature)

```text
specs/018-guardrail-node-targets/
├── plan.md              # This file
├── research.md          # Phase 0 output (revisado)
├── data-model.md         # Phase 1 output (revisado)
├── quickstart.md         # Phase 1 output (revisado)
├── contracts/
│   └── prompt-node-type.md  # substitui o contrato anterior (guardrail-nodes-contract.md, descartado)
└── tasks.md              # Phase 2 output (revisado)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── admin/
│       ├── TenantContextCard.tsx              # [MODIFIED] usa is_default_prompt (campo corrigido)
│       └── prompt-manager/
│           ├── PromptFormModal.tsx             # [MODIFIED] + seletor "Nó de Destino"
│           ├── PromptFormModal.test.tsx        # [NEW]
│           ├── PromptList.tsx                  # [MODIFIED] + badge de nó
│           ├── TenantLinkSection.tsx           # [MODIFIED] + seletor de nó, filtro de prompts
│           ├── TenantLinkSection.test.tsx      # [NEW]
│           ├── GuardrailFormModal.tsx          # revertido ao estado pré-feature (sem node)
│           └── GuardrailList.tsx               # revertido ao estado pré-feature (sem node)
├── services/
│   ├── promptManager.ts                        # [MODIFIED] fetchTenantPromptDetail(tenantId, nodeType?)
│   ├── promptManager.types.ts                  # [MODIFIED] NodeType, Prompt.node_type, TenantPromptDetail corrigido
│   └── promptManager.test.ts                   # [MODIFIED] cobre o query param node_type
├── lib/
│   ├── promptManagerSchemas.ts                 # [MODIFIED] node_type em promptFormSchema
│   └── promptManagerSchemas.test.ts            # [MODIFIED]
└── hooks/
    └── useTenantLink.ts                        # [MODIFIED] fetchDetail/linkTenant recebem nodeType
```

**Structure Decision**: Extensão pontual da feature existente `015-admin-prompt-guardrails` — nenhum novo
diretório, hook ou rota. O modelo de dados segue exatamente o que o backend real já implementou.

## Complexity Tracking

> Nenhuma violação justificada necessária — todos os gates passaram.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A (sem violações) | — | — |
