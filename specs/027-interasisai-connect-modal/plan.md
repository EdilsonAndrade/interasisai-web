# Implementation Plan: InterasisAI Connect — Rebranding do Card e Página de Valor

**Branch**: `edilsonaandrade/edi-70-landing-page-renomear-card-para-interasisai-connect-e` | **Date**: 2026-08-30 (revisado) | **Spec**: [spec.md](./spec.md)
**Linear**: [EDI-70](https://linear.app/edilsonandrade/issue/EDI-70/landing-page-renomear-card-para-interasisai-connect-e-criar-pagina)
**Input**: Feature specification from `specs/027-interasisai-connect-modal/spec.md`

## Summary

Renomear o card de portfólio "Assistente IA Omnichannel (RAG)" para **InterasisAI Connect**, adicionar um texto de impacto de negócio ao card e um botão "Saiba mais" que **navega para uma página própria e compartilhável** (`/{locale}/interasisai-connect`), seguindo o mesmo padrão das páginas institucionais já existentes no projeto (`sobre`, `termos`, `politica-de-privacidade`): `generateMetadata` com título/descrição/Open Graph específicos, listagem em `sitemap.ts`, e reaproveitamento do layout raiz (`Header`/`Footer`/`ChatProvider`/`ChatWidgetLoader`). A página recria, em componentes React/Tailwind (não HTML estático), os blocos de conteúdo do material de referência `apresentacao-interasisconnect.html`: comparação de conversas "atendimento comum vs. InterasisAI Connect" com 5 abas de vertical de negócio, explicação leiga da arquitetura, tabela comparativa e passos do processo. Todo o conteúdo textual (card + página) é adicionado aos três catálogos de idioma existentes (`pt-BR`, `en`, `es`) via `next-intl`.

**Revisão 2026-08-30**: a versão inicial deste plano usava uma modal (`PortfolioValueModal` sobreposta à landing page). Trocado para página dedicada a pedido do solicitante, pois o requisito de **compartilhamento do link** (WhatsApp/LinkedIn) exige URL própria com metadados de Open Graph específicos — o que uma modal aberta por estado local não entrega. Uma abordagem híbrida (intercepting route: modal ao navegar internamente, página cheia no acesso direto) foi avaliada e descartada por complexidade adicional não justificada agora (ver `research.md`).

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 16.2.4 (App Router) / React 19.2.4
**Primary Dependencies**: `next-intl` (i18n + rotas por locale via `src/i18n/routing.ts`), `framer-motion` (transições de entrada dos blocos da página), `lucide-react` (ícones), `clsx` + `tailwind-merge` (composição de estilos)
**Storage**: N/A — conteúdo estático localizado nos catálogos `src/i18n/locales/{pt-BR,en,es}/home.json`
**Testing**: Jest + React Testing Library, conforme Princípio IV da constituição (NON-NEGOTIABLE)
**Target Platform**: Web responsivo (Next.js SSR + hidratação client-side para a troca de abas), nova rota pública `src/app/[locale]/interasisai-connect/page.tsx`
**Project Type**: Aplicação web única existente (sem split frontend/backend nesta feature — sem mudanças de API/backend)
**Performance Goals**: Página renderizada no servidor (SSR) como as demais páginas institucionais — sem necessidade de `next/dynamic` para o conteúdo estático; apenas o subcomponente de abas de vertical roda no client (`"use client"`) para a interatividade
**Constraints**: Proibido `dangerouslySetInnerHTML` para conteúdo de usuário/IA (Princípio VIII) — exceção já estabelecida no projeto (`organizationJsonLd` em `src/app/[locale]/layout.tsx`) para injetar JSON-LD estático de dados estruturados, que esta feature reaproveita para o schema de serviço e de breadcrumb; o HTML de referência serve apenas de fonte de conteúdo/tom, tudo é recriado como JSX + dados estruturados; todo texto novo precisa existir nos 3 idiomas suportados antes do lançamento; a página precisa de `generateMetadata` (title/description/openGraph/alternates) próprios, distintos da home (Princípio VII); reforço de SEO (2026-08-30): JSON-LD de serviço + breadcrumb, e imagem de Open Graph dedicada (com fallback para a capa genérica enquanto o ativo definitivo não é entregue)
**Scale/Scope**: 1 card existente (edição), 1 rota nova (`page.tsx` + 1-2 componentes de apresentação + 1 componente client para as abas), 1 entrada nova em `sitemap.ts`, 1 dataset de 5 cenários por vertical (localizado), sem novas chamadas de API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Aplicação nesta feature | Status |
|---|---|---|
| I. Separação Hooks & UI | Nenhuma lógica de negócio/fetch nova; estado da vertical ativa é UI state local via `useState` no componente client de abas, não requer hook dedicado | ✅ Pass |
| II. Context API | Nenhum novo Context — a página só consome o `ChatProvider` já existente (herdado do layout raiz) para o botão "Testar Assistente ao Vivo" funcionar igual à home | ✅ Pass |
| III. DRY & Componentização | Nova rota segue o padrão já estabelecido por `src/app/[locale]/sobre/page.tsx` (metadata + `getTranslations`); componentes de apresentação novos ficam em `src/components/connect/` para não inflar `PortfolioCard`/`PortfolioSection` | ✅ Pass |
| IV. Testes Unitários | RTL cobrindo: render do novo texto de impacto no card, link "Saiba mais" aponta para a URL correta, troca de aba de vertical atualiza conteúdo na página, navegação por teclado entre abas | ✅ Pass (tasks na Fase de implementação) |
| V. TypeScript & Erros | Sem `any`; tipos para `ConnectPageContent` e `VerticalScenario` | ✅ Pass |
| VI. Identidade Visual | Página usa Tailwind + glassmorphism/glow consistente com o restante do site; sem CSS externo | ✅ Pass |
| VII. SEO/Semântica/A11y | `generateMetadata` com title/description/openGraph/alternates próprios; heading hierarchy própria (`h1`→`h2`→`h3`); página listada em `sitemap.ts`; abas de vertical acessíveis por teclado | ✅ Pass — este princípio é justamente o motivo da mudança de modal para página |
| VIII. Segurança | `dangerouslySetInnerHTML` usado apenas para os `<script type="application/ld+json">` de dados estruturados (mesmo padrão já existente em `layout.tsx`), nunca para conteúdo de usuário/IA; conteúdo 100% de dados locais (i18n), não há input de usuário nesta feature | ✅ Pass |

Nenhuma violação identificada — não é necessário preencher "Complexity Tracking".

## Project Structure

### Documentation (this feature)

```text
specs/027-interasisai-connect-modal/
├── plan.md              # Este arquivo
├── research.md          # Fase 0
├── data-model.md         # Fase 1
├── quickstart.md         # Fase 1
├── contracts/
│   └── ui-contracts.md   # Fase 1 — contratos de props, metadata e chaves de i18n
└── tasks.md              # Fase 2 (/speckit.tasks)
```

### Source Code (repository root)

Aplicação Next.js única existente — nenhuma estrutura nova de projeto é criada, apenas arquivos dentro da árvore atual:

```text
src/
├── app/[locale]/
│   ├── interasisai-connect/
│   │   └── page.tsx                     # NOVO — generateMetadata + página server component
│   └── sobre/page.tsx                   # Referência de padrão (metadata + alternates)
├── app/
│   └── sitemap.ts                       # Editar: adicionar rota "/interasisai-connect"
├── components/
│   ├── connect/
│   │   ├── ConnectPage.tsx              # NOVO — composição dos blocos estáticos da página
│   │   ├── ConnectVerticalComparison.tsx # NOVO — "use client", abas de vertical + simulação de conversa
│   │   ├── ConnectVerticalComparison.test.tsx # NOVO
│   │   ├── connectStructuredData.ts     # NOVO — monta os objetos JSON-LD (Service + BreadcrumbList)
│   │   └── types.ts                     # NOVO — ConnectPageContent, VerticalScenario
│   └── ui/
│       ├── PortfolioCard.tsx            # Editar: novo campo de texto de impacto + link "Saiba mais"
│       ├── PortfolioCard.test.tsx       # Editar/criar
│       └── PortfolioSection.tsx         # Editar: passar impactText + href da nova página (via getLocale())
└── i18n/locales/
    ├── pt-BR/home.json                  # Editar: título, impactText, ação "Saiba mais", conteúdo da página
    ├── en/home.json                     # Editar: idem, traduzido
    └── es/home.json                     # Editar: idem, traduzido
```

**Structure Decision**: Extensão da estrutura existente. A nova página segue exatamente o padrão de `src/app/[locale]/sobre/page.tsx` (mesma convenção de slug único nos 3 idiomas, `generateMetadata`, `sitemap.ts`). O conteúdo textual (incluindo os 5 cenários por vertical) vive nos catálogos `next-intl` já usados pelo restante do portfólio, sob um novo namespace `connectPage` (ou aninhado em `portfolio.projects.chatAssistant`, decisão registrada em `research.md`), para manter uma única fonte de verdade de tradução por idioma.

## Complexity Tracking

*Sem violações da constituição — seção não aplicável.*
