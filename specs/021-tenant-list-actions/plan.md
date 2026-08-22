# Implementation Plan: Exclusão com confirmação de impacto, edição e atalho WhatsApp na tela de tenant

**Branch**: `edilsonaandrade/edi-46-frontend-tela-de-tenants-exclusao-com-confirmacao-de-impacto` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/021-tenant-list-actions/spec.md`
**Ticket**: EDI-46 (frontend) — depende de EDI-45 (backend, em desenvolvimento em paralelo; contrato tratado como estável, validação de integração ao final)

## Summary

Três frentes sobre a tela de tenant já existente (consulta por ID): (1) modal de exclusão passa a buscar `GET /tenants/{id}/delete-impact` e exigir confirmação por nome exato antes de chamar `DELETE /tenants/{id}`, avaliando prompts e guardrails de forma independente; (2) o card do tenant passa a mostrar prompts dos três `node_type` (operacional, institucional, chitchat) e destaca guardrails globais reaproveitando o `GuardrailScopeBadge` já existente; (3) atalho "WhatsApp" no card do tenant navega para `/admin/whatsapp` pré-preenchendo Tenant ID e Nome da Instância via query string. O botão "Editar" já atende ao critério do ticket sem mudança.

**Abordagem técnica**: nada de arquitetura nova — composição sobre os padrões já vigentes (hook/UI, `AdminDialog`, `normalizeApiError`). Dois hooks novos e pequenos (`useTenantDeleteImpact`, `useTenantNodePrompts`) ao lado dos já existentes (`useTenantManagement`, `useTenantPromptBinding`), sem tocar sua responsabilidade atual.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16.2 (App Router)
**Primary Dependencies**: react-hook-form 7.85 + zod 4.4, Tailwind 3.4, framer-motion 12, lucide-react
**Storage**: N/A no frontend — estado de servidor via API Python (`NEXT_PUBLIC_PYTHON_BACKEND_URL`)
**Testing**: Jest 30 + React Testing Library 16, jsdom; `npm test`
**Target Platform**: navegadores modernos; área administrativa em `/[locale]/admin`
**Project Type**: aplicação web (frontend puro; backend em repositório separado)
**Performance Goals**: nenhuma meta nova; consulta do tenant passa de 1 para 4 chamadas paralelas (impacto sob demanda ao abrir o modal + 3 `node_type` em paralelo via `Promise.all` ao consultar o tenant) — sem N+1, todas fixas
**Constraints**: sem `any`; sem fetch em `.tsx`; sem `dangerouslySetInnerHTML`; erros nunca silenciosos; comparação de nome exata (sem normalizar além de `trim()` do texto digitado)
**Scale/Scope**: 2 hooks novos, 1 serviço novo (`fetchTenantDeleteImpact`), ~3 componentes alterados, 1 componente reaproveitado sem mudança (`GuardrailScopeBadge`)

## Constitution Check

*GATE: avaliado antes da Fase 0 e reavaliado após a Fase 1.*

| # | Princípio | Como o plano atende | Status |
|---|---|---|---|
| I | Separação hook/UI | Toda busca de impacto (`useTenantDeleteImpact`) e de prompts por node_type (`useTenantNodePrompts`) vive em hooks; `TenantDeleteDialog`/`TenantDetails` só recebem estado e callbacks. | ✅ |
| II | Estado via Context API | Nenhum estado global novo. Pré-preenchimento do WhatsApp via query string (Next.js), não Context — dois valores primitivos entre navegações independentes não justificam um Provider novo. | ✅ |
| III | DRY / componentização | `GuardrailScopeBadge` (já existente) reaproveitado em dois lugares novos em vez de recriar o indicador de global. `AdminDialog` reaproveitado sem mudança para o modal de exclusão. | ✅ |
| IV | Testes (não negociável) | `renderHook` para os dois hooks novos; RTL para `TenantDeleteDialog` (botão desabilitado até nome exato, Esc/cancelar sem efeito, erro na busca de impacto não libera confirmação) e para os badges de node_type/global. AAA em todos; fetch mockado. | ✅ |
| V | TypeScript & erros | Tipos novos (`TenantDeleteImpact`, itens) sem `any`; erros via `normalizeApiError`/`tenantFailure`, já existentes. Falha na busca de impacto vira estado de erro visível, nunca silenciosa. | ✅ |
| VI | Identidade visual | Tailwind apenas; segue o estilo já usado em `TenantDeleteDialog`/`AdminDialog` (glassmorphism, `rounded-card`, hover ≤ 1.05). | ✅ |
| VII | SEO/semântica/a11y | Sem `page.tsx` novo. Campo de confirmação com `<label>` associado; grupos do resumo de impacto com `role="alert"` onde cabível; botão desabilitado via atributo nativo (navegável por teclado). | ✅ |
| VIII | Segurança | Sem `dangerouslySetInnerHTML`; nenhuma entrada nova precisa de Zod (o campo de confirmação é comparação de string, não submissão de formulário); nenhum segredo novo. | ✅ |

**Resultado**: nenhuma violação. Seção de Complexity Tracking omitida.

**Reavaliação pós-Fase 1**: nenhuma violação introduzida pelo design. `useTenantNodePrompts` foi mantido separado de `useTenantPromptBinding` justamente para não misturar o fluxo obrigatório/corrigível (operacional, EDI-44) com a exibição somente-leitura (institucional/chitchat), preservando o Princípio I.

## Project Structure

### Documentation (this feature)

```text
specs/021-tenant-list-actions/
├── plan.md              # Este arquivo
├── spec.md              # Especificação
├── research.md          # Fase 0
├── data-model.md         # Fase 1
├── quickstart.md         # Fase 1
├── contracts/
│   └── api-contract.md  # Fase 1 — contrato consumido do EDI-45
├── checklists/
│   └── requirements.md
└── tasks.md              # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── pythonBackend.ts                  # ALT — fetchTenantDeleteImpact() + listTenants() (US4)
│   └── pythonBackend.types.ts            # ALT — TenantDeleteImpact, TenantGridItem e itens
├── hooks/
│   ├── useTenantDeleteImpact.ts          # NOVO — busca/estado do resumo de impacto
│   ├── useTenantNodePrompts.ts           # NOVO — prompt+guardrails por node_type (3x em paralelo)
│   ├── useTenantGrid.ts                  # NOVO (US4) — página do grid, paginação offset/limit
│   └── useTenantManagement.ts            # sem mudança de contrato (remove() já chama deleteTenant)
└── components/admin/
    ├── GuardrailScopeBadge.tsx           # sem mudança — reaproveitado
    ├── TenantPromptBindingCard.tsx       # ALT — badge de global na seção de guardrails
    ├── WhatsAppInstanceForm.tsx          # ALT — lê searchParams para defaultValues
    └── tenants/
        ├── TenantDeleteDialog.tsx        # ALT — resumo de impacto + confirmação por nome
        ├── TenantDetails.tsx             # ALT — atalho WhatsApp + prompts por node_type
        ├── TenantGrid.tsx                # NOVO (US4) — grid id+nome, paginação
        └── TenantManagement.tsx          # ALT — fia os hooks novos, inclui useTenantGrid
```

**Nota (US4, adicionada após a implementação inicial)**: `listTenants()` consome `GET /tenants/list`, endpoint **novo e separado** de `GET /tenants` (usado por `searchTenants`/feature 017, intocado) — ver `research.md` item 10.

Testes acompanham cada arquivo como `*.test.ts(x)` no mesmo diretório — convenção já vigente no repositório.

**Structure Decision**: mantida a estrutura existente — nenhum diretório novo. Os dois hooks novos ficam em `src/hooks` ao lado dos hooks de tenant já existentes; nenhuma lógica nova entra em `src/lib` porque não há regra de negócio pura isolável além de comparação de string (que vive no próprio componente do modal, trivial demais para justificar um módulo).

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Contrato do EDI-45 ainda não implementado no backend | `quickstart.md` traz o roteiro de verificação manual a ser rodado quando o backend estiver pronto. Testes automatizados mockam o contrato acordado (`contracts/api-contract.md`); divergência aparece na verificação manual, não em produção — decisão explícita do usuário. |
| Comparação de nome exata frustrar o admin por diferença invisível (espaço, acento) | `trim()` do texto digitado antes de comparar; nenhuma outra normalização, documentado em `research.md` item 6 e testado explicitamente. |
| `useTenantNodePrompts` disparar 3 chamadas em série por engano (latência) | Implementado com `Promise.all`, testado para garantir chamadas em paralelo, não sequenciais. |
| Falha na busca de impacto liberar a exclusão "às cegas" | FR-008: estado de erro bloqueia o campo de confirmação por nome; coberto por teste explícito em `TenantDeleteDialog.test.tsx`. |
