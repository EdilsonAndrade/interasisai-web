# Implementation Plan: InterasisAI Connect — Posicionamento de Integrações e Expansibilidade (Card e Página Saiba Mais)

**Branch**: `028-ai-connect-integrations` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/028-ai-connect-integrations/spec.md`

## Summary

Evoluir o posicionamento público do **InterasisAI Connect** em dois pontos da aplicação existente:

1. **Card do portfólio (landing page)**: substituir o texto de impacto atual por uma mensagem que comunique que o produto vai além do agendamento — ele se integra a CRMs, bases de dados, APIs e outros sistemas, e é expansível sob medida via projeto de escopo fechado (mantendo o agendamento como funcionalidade básica).
2. **Página Saiba Mais (`/interasisai-connect`)**: adicionar uma nova seção de integrações com (a) textos acessíveis explicando as categorias integráveis e o modelo de projeto de escopo fechado, e (b) um **diagrama animado** — núcleo central (chat + agentes) conectado por setas animadas em loop contínuo a nós de ambientes (API, base de dados, MCP, sistemas de RH, entre outros) — com fallback estático para `prefers-reduced-motion`, alternativa textual para leitores de tela e reorganização responsiva sem rolagem horizontal.

Toda a comunicação usa categorias genéricas (nenhuma marca de terceiros como parceira oficial) e é localizada nos 3 idiomas do site (pt-BR, en, es) via `next-intl`, seguindo os padrões já estabelecidos pela spec 027 (página `interasisai-connect`).

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 16.2.4 (App Router) / React 19.2.4
**Primary Dependencies**: `next-intl` (i18n), `framer-motion` (animação do diagrama — já presente no projeto), `lucide-react` (ícones dos nós), `clsx` + `tailwind-merge` (composição de estilos)
**Storage**: N/A — conteúdo estático localizado em `src/i18n/locales/{pt-BR,en,es}/connect.json` (nova seção) e `home.json` (textos do card)
**Testing**: Jest + React Testing Library (Princípio IV da constituição)
**Target Platform**: Web responsivo (Next.js SSR); edição na rota existente `src/app/[locale]/interasisai-connect/page.tsx` e na seção de portfólio da home
**Project Type**: Aplicação web única existente (sem split frontend/backend — nenhuma mudança de API/backend)
**Performance Goals**: A página Saiba Mais continua 100% renderizada no servidor; apenas o leaf do diagrama animado é um client component leve (SVG + transforms CSS compostados por GPU); sem necessidade de `next/dynamic` (componente leve, sem biblioteca pesada)
**Constraints**: Proibido `dangerouslySetInnerHTML` para conteúdo de usuário/IA (Princípio VIII); animação respeita `prefers-reduced-motion` (fallback estático com todos os rótulos legíveis); sem rolagem horizontal em mobile; nenhuma marca de terceiros citada como parceira oficial; todo texto novo deve existir nos 3 idiomas; agendamento permanece apresentado como funcionalidade básica
**Scale/Scope**: 1 novo client component (diagrama) + extensão de `ConnectPage`/`types.ts`, edição de `PortfolioSection` (mapeamento de highlights) e de 6 arquivos de i18n (3× `home.json` + 3× `connect.json`), ~3 arquivos de teste novos/atualizados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Aplicação nesta feature | Status |
|---|---|---|
| I. Separação Hooks & UI | Nenhuma lógica de negócio nova; o estado do diagrama (animado vs. estático) vem de `useReducedMotion()` dentro do client component, como já faz `FadeIn.tsx`. Se a lógica de posicionamento dos nós/linhas crescer, será extraída para um hook dedicado (`useIntegrationDiagram`) em vez de viver no `.tsx` | ✅ Pass |
| II. Context API | Nenhum novo Context; a página continua consumindo o `ChatProvider` existente do layout raiz | ✅ Pass |
| III. DRY & Componentização | O diagrama é um componente atômico reutilizável em `src/components/connect/`; o mapeamento de highlights do card passa a usar `t.raw(...)` (remove a indexação manual 0–3) | ✅ Pass |
| IV. Testes Unitários | RTL: novo texto de posicionamento no card, seção de integrações na página, rótulos dos nós do diagrama, fallback estático com `prefers-reduced-motion`, alternativa textual para leitores de tela; AAA pattern | ✅ Pass (tasks na fase de implementação) |
| V. TypeScript & Erros | Sem `any`; tipos novos `IntegrationCategory` e `ConnectIntegrationsContent` em `types.ts` | ✅ Pass |
| VI. Identidade Visual | Tailwind puro; animação com Framer Motion (`repeat: Infinity`, easing linear), transforms/opacity compostados por GPU, glow via `shadow-[...]` — coerente com o restante do site | ✅ Pass |
| VII. SEO/Semântica/A11y | Seção usa heading hierarchy (`h2` → `h3`); diagrama com `role="img"` + `aria-label`/alternativa textual; fallback com `prefers-reduced-motion`; sem mudança de metadados da página | ✅ Pass |
| VIII. Segurança | Conteúdo 100% local (i18n), sem input de usuário; nenhum `dangerouslySetInnerHTML` novo | ✅ Pass |

Nenhuma violação identificada — "Complexity Tracking" não é necessária.

## Project Structure

### Documentation (this feature)

```text
specs/028-ai-connect-integrations/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisões de animação, acessibilidade e responsividade
├── data-model.md        # Fase 1 — entidades de conteúdo
├── quickstart.md        # Fase 1 — como rodar/testar
├── contracts/
│   └── ui-contracts.md  # Fase 1 — contratos de props e chaves i18n
└── tasks.md             # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

Extensão da aplicação Next.js existente — nenhuma estrutura nova de projeto:

```text
src/
├── app/[locale]/interasisai-connect/
│   └── page.tsx                        # Editar: montar content.integrations (t.raw) e passar ao ConnectPage
├── components/
│   ├── connect/
│   │   ├── ConnectPage.tsx             # Editar: nova seção de integrações (entre architecture e comparisonTable)
│   │   ├── ConnectPage.test.tsx        # Editar: casos da seção de integrações
│   │   ├── ConnectIntegrationDiagram.tsx       # NOVO — "use client", diagrama animado + fallback estático
│   │   ├── ConnectIntegrationDiagram.test.tsx  # NOVO
│   │   └── types.ts                    # Editar: IntegrationCategory, ConnectIntegrationsContent
│   └── ui/
│       ├── PortfolioSection.tsx        # Editar: highlights via t.raw(...) (permite 5º highlight)
│       └── PortfolioCard.tsx           # (sem mudança de código — conteúdo via props já existentes)
└── i18n/locales/
    ├── pt-BR/home.json                 # Editar: description/impactText/highlights do chatAssistant
    ├── en/home.json                    # Editar: idem, traduzido
    ├── es/home.json                    # Editar: idem, traduzido
    ├── pt-BR/connect.json              # Editar: nova chave "integrations"
    ├── en/connect.json                 # Editar: idem
    └── es/connect.json                 # Editar: idem
```

**Structure Decision**: Extensão direta da estrutura criada na spec 027. A seção de integrações vive em `src/components/connect/`; o diagrama animado é um client component leaf (mesmo padrão de `ConnectVerticalComparison`), mantendo `ConnectPage` e a rota como server components. Conteúdo textual fica nos catálogos `next-intl`, sob a nova chave `connect.integrations` e nas chaves existentes de `portfolio.projects.chatAssistant`.

## Complexity Tracking

*Sem violações da constituição — seção não aplicável.*
