# Implementation Plan: Vínculo obrigatório de prompt no tenant e associação em massa

**Branch**: `edilsonaandrade/edi-44-frontend-vinculo-obrigatorio-de-prompt-no-cadastro-de-tenant` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/020-tenant-prompt-binding/spec.md`
**Ticket**: EDI-44 (frontend) — depende de EDI-43 (backend, pronto para teste local)

## Summary

Cinco frentes de UI sobre a mesma base: (1) `prompt_id` obrigatório no cadastro de tenant, com combo sem pré-seleção e caminho "criar a partir de modelo"; (2) alerta de configuração quebrada e correção in-place no detalhe do tenant; (3) associação de um prompt a N tenants com preview do diff; (4) guardrails globais separados visualmente na visão do tenant; (5) tratamento de erros estruturados (`{code, message, blockers}`) em todo o admin.

**Abordagem técnica**: a mudança de contrato mais transversal é o envelope de erro — hoje `getErrorMessage` em `promptManager.ts` e `getOperationErrorMessage` em `pythonBackend.ts` assumem `detail` como string ou lista. Ambos passam a normalizar três formatos para uma estrutura única (`ApiError { code, message, blockers }`), e todo consumidor decide por `code`. Feito isso, o resto é composição: hooks novos (`usePromptTenants`, `useBulkTenantLink`, `useTenantPromptBinding`) e componentes de apresentação, seguindo a separação hook/UI já vigente no projeto.

O único ponto de arquitetura novo é o fluxo composto de cadastro ("criar prompt → criar tenant"), que vive inteiro no hook, nunca no componente.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16.2 (App Router)
**Primary Dependencies**: react-hook-form 7.85 + zod 4.4 (`@hookform/resolvers`), Tailwind 3.4, framer-motion 12, lucide-react, sonner (toasts), react-markdown + rehype-sanitize
**Storage**: N/A no frontend — estado de servidor via API Python (`NEXT_PUBLIC_PYTHON_BACKEND_URL`)
**Testing**: Jest 30 + React Testing Library 16, jsdom; `npm test` (`--runInBand`)
**Target Platform**: navegadores modernos; área administrativa em `/[locale]/admin`
**Project Type**: aplicação web (frontend puro; backend em repositório separado)
**Performance Goals**: nenhuma meta nova; o único risco de custo é a associação em massa, resolvida em 2 chamadas fixas (lista de vinculados + gravação), não em N
**Constraints**: sem `any`; sem fetch em `.tsx`; sem `dangerouslySetInnerHTML`; validação com Zod antes de qualquer chamada; conteúdo de prompt e override nunca em log
**Scale/Scope**: ~7 componentes novos/alterados, ~4 hooks, 2 serviços, 2 arquivos de schema. Escopo restrito ao nó operacional.

### Contrato do backend (acordado no EDI-44, a validar localmente)

| Operação | Endpoint | Mudança |
|---|---|---|
| Criar tenant | `POST /api/v1/tenants/` | ganha `prompt_id` (UUID, obrigatório, nó operacional). Transacional. |
| Listar prompts | `GET /api/v1/prompt-manager/prompts?node_type=operational` | filtro por query param |
| Tenants de um prompt | `GET /api/v1/prompt-manager/prompts/{id}/tenants` | **novo** — `{prompt_id, node_type, tenants:[{id,name}]}` |
| Vínculo em massa | `POST /api/v1/prompt-manager/link-tenants` | **novo** — all-or-nothing, substitui o vínculo do nó |
| Overview do tenant | `GET /api/v1/prompt-manager/tenant/{id}?node_type=operational` | response model inalterado |
| Excluir prompt | `DELETE .../prompts/{id}` | 409 `PROMPT_IN_USE_BY_TENANTS` + `blockers` |
| Excluir guardrail | `DELETE .../guardrails/{id}` | 409 `GUARDRAIL_IS_GLOBAL` \| `GUARDRAIL_IN_USE_BY_TENANTS` |

## Constitution Check

*GATE: avaliado antes da Fase 0 e reavaliado após a Fase 1.*

| # | Princípio | Como o plano atende | Status |
|---|---|---|---|
| I | Separação hook/UI | Todo fetch e orquestração em hooks (`useTenantManagement` estendido, `usePromptTenants`, `useBulkTenantLink`, `useTenantPromptBinding`). O fluxo composto "criar prompt → criar tenant" vive no hook, não no `TenantForm`. Componentes recebem dados e callbacks. | ✅ |
| II | Estado via Context API | Nenhum estado global novo. O estado é local à página de admin e já compartilhado por props (padrão do `PromptManagerPage`). Context seria overkill aqui. | ✅ |
| III | DRY / componentização | `BlockerList` é componente único reutilizado por três consumidores (409 de prompt, 409 de guardrail, preview do vínculo em massa) — o contrato de dados é idêntico de propósito. `PromptSelectField` reutilizado entre cadastro e correção in-place. `GuardrailScopeBadge` já existe e é reaproveitado. | ✅ |
| IV | Testes (não negociável) | Todo hook novo com `renderHook`; todo componente interativo com RTL e queries acessíveis; AAA; API mockada. Casos obrigatórios: bloqueio de submit sem prompt, ausência de pré-seleção, preservação de `{guardrails}`, supressão do conteúdo no estado de erro, diff da massa, os três formatos de `detail`. | ✅ |
| V | TypeScript & erros | `ApiError` e `Blocker` tipados; `ApiErrorCode` como union literal. Zero `any` — o normalizador usa `unknown` + type guards, como o `isGuardrail` existente. Nenhum erro silencioso: falha vira estado de UI ou toast. | ✅ |
| VI | Identidade visual | Tailwind apenas; glassmorphism e `rounded-card` como no admin atual; hover ≤ 1.05; sem CSS externo. | ✅ |
| VII | SEO/semântica/a11y | Área administrativa, sem `page.tsx` novo (logo sem metadata nova). Combo com `<label>` associado; alerta com `role="alert"`; multi-select navegável por teclado; hierarquia de headings preservada. | ✅ |
| VIII | Segurança | Zod em todo formulário antes da chamada; sem `dangerouslySetInnerHTML` (o editor markdown já usa `rehype-sanitize`); nenhum segredo novo; conteúdo de prompt e override permanecem fora do log (FR-039, regra já vigente em `promptManager.ts`). | ✅ |

**Resultado**: nenhuma violação. Seção de Complexity Tracking omitida.

**Reavaliação pós-Fase 1**: nenhuma violação introduzida pelo design. Único ponto que merecia atenção — o fluxo de duas chamadas no cadastro — foi resolvido dentro do hook, preservando o princípio I.

## Project Structure

### Documentation (this feature)

```text
specs/020-tenant-prompt-binding/
├── plan.md              # Este arquivo
├── spec.md              # Especificação
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── api-contract.md  # Fase 1 — contrato consumido pelo frontend
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── apiError.ts                       # NOVO — normaliza os 3 formatos de detail
│   ├── promptBinding.ts                  # NOVO — ponto único de detecção (FR-014)
│   ├── promptContent.ts                  # NOVO — validação do marcador {guardrails}
│   ├── tenantSchemas.ts                  # ALT — prompt_id no schema de criação
│   └── promptManagerSchemas.ts           # ALT — schema do vínculo em massa
├── services/
│   ├── promptManager.ts                  # ALT — node_type na listagem, /prompts/{id}/tenants,
│   │                                     #       link-tenants, erros via apiError
│   ├── promptManager.types.ts            # ALT — tipos novos
│   ├── pythonBackend.ts                  # ALT — prompt_id no createTenant, erros via apiError
│   └── pythonBackend.types.ts            # ALT — prompt_id em TenantCreateInput
├── hooks/
│   ├── useTenantPromptBinding.ts         # NOVO — estado de vínculo do tenant + correção
│   ├── usePromptTenants.ts               # NOVO — tenants vinculados a um prompt
│   ├── useBulkTenantLink.ts              # NOVO — seleção, diff e gravação em massa
│   ├── useTenantManagement.ts            # ALT — fluxo composto de criação
│   ├── usePrompts.ts                     # ALT — 409 com blockers
│   └── useGuardrails.ts                  # ALT — 409 com blockers + desmarcar-e-excluir
└── components/admin/
    ├── BlockerList.tsx                   # NOVO — lista reutilizável de bloqueadores
    ├── PromptSelectField.tsx             # NOVO — combo sem pré-seleção + rótulo "padrão"
    ├── TenantPromptBindingCard.tsx       # NOVO — vínculo + alerta + correção in-place
    ├── TenantContextCard.tsx             # ALT — globais em seção própria
    ├── tenants/
    │   ├── TenantForm.tsx                # ALT — campo de prompt no modo create
    │   ├── TenantDetails.tsx             # ALT — embute o card de vínculo
    │   └── TenantManagement.tsx          # ALT — fia o hook novo
    └── prompt-manager/
        ├── BulkTenantLinkModal.tsx       # NOVO — multi-select + preview + confirmação
        ├── PromptList.tsx                # ALT — ação "Aplicar a tenants" + 409 com blockers
        ├── PromptFormModal.tsx           # ALT — modo "a partir de modelo"
        ├── GuardrailList.tsx             # ALT — 409 com blockers
        └── PromptManagerPage.tsx         # ALT — fia o modal de massa
```

Testes acompanham cada arquivo como `*.test.ts(x)` no mesmo diretório — convenção já vigente no repositório (não há diretório `tests/` separado).

**Structure Decision**: mantida a estrutura existente do projeto — `src/lib` para lógica pura, `src/services` para HTTP, `src/hooks` para orquestração, `src/components/admin` para UI. Nenhum diretório novo. Três módulos em `src/lib` são criados porque concentram lógica pura e testável isoladamente: normalização de erro, detecção de vínculo (o "ponto único" exigido pelo FR-014) e validação do marcador de guardrails.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Contrato ainda não validado contra o backend rodando | `quickstart.md` traz o roteiro de verificação manual contra o backend local antes de fechar a implementação. Os testes mockam o contrato acordado; divergência aparece na verificação, não em produção. |
| FR-008 (`{guardrails}` preservado) falha em silêncio | `promptContent.ts` isolado e testado; aviso na UI quando o marcador some do texto editado. É o item de maior impacto invisível da feature. |
| FR-015 (não exibir conteúdo do padrão no estado de erro) regride | Teste explícito assertando **ausência** do conteúdo quando o vínculo está faltando. |
| Detecção por `is_default_prompt` é frágil no longo prazo | Concentrada em `promptBinding.ts`; trocar o sinal é alterar uma função e seu teste. |
| Prompt órfão acumulando na biblioteca | Decisão aceita (FR-010). Mensagem de erro informa que o prompt ficou disponível para nova tentativa. |
