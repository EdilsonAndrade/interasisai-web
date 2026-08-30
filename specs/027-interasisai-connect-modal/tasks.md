---
description: "Task list for InterasisAI Connect — Card Rebrand & Página de Valor"
---

# Tasks: InterasisAI Connect — Rebranding do Card e Página de Valor

**Input**: Design documents from `specs/027-interasisai-connect-modal/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contracts.md, quickstart.md

**Tests**: Incluídos e OBRIGATÓRIOS — Princípio IV da constituição do projeto (`.specify/memory/constitution.md`) exige cobertura automatizada (Jest + React Testing Library) para todo componente interativo, sem exceção de "opcional".

**Organization**: Tarefas agrupadas por user story (spec.md), na ordem de prioridade (US1 e US2 são P1; US3 é P2).

> **Notas de revisão (2026-08-30)**: (1) "Saiba mais" deixou de ser uma modal e passou a ser uma **página dedicada e compartilhável** (`/{locale}/interasisai-connect`), seguindo o padrão de `src/app/[locale]/sobre/page.tsx` — ver `research.md` Decisão 1. (2) Reforço de SEO adicionado: dados estruturados JSON-LD (`Service` + `BreadcrumbList`) e imagem de Open Graph dedicada (com fallback) — ver `research.md` Decisões 6 e 7, e FR-013/FR-014/FR-015 do spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1, US2 ou US3 — mapeando para as user stories do spec.md
- Caminhos de arquivo são absolutos em relação à raiz do repositório

## Setup / Foundational

Não há tarefas de setup bloqueantes: o projeto Next.js já está inicializado, nenhuma dependência nova é necessária, e o padrão de página institucional a seguir já existe (`src/app/[locale]/sobre/page.tsx`, `src/i18n/request.ts`, `src/app/sitemap.ts`, `organizationJsonLd` em `layout.tsx` como precedente de JSON-LD). As tarefas começam diretamente pelas user stories.

---

## Phase 1: User Story 1 - Reconhecer o produto pelo novo nome e por um texto de impacto (Priority: P1) 🎯 MVP (parte 1/2)

**Goal**: O card de portfólio exibe "InterasisAI Connect" e um texto de impacto de negócio, nos 3 idiomas, sem depender do botão ou da página de valor.

**Independent Test**: Abrir a landing page em pt-BR, en e es e conferir visualmente que o card exibe o novo nome e o texto de impacto.

### Tests for User Story 1 ⚠️

> Escrever estes testes primeiro; devem falhar antes da implementação.

- [X] T001 [US1] Escrever teste RTL em `src/components/ui/PortfolioCard.test.tsx` cobrindo: (a) o card renderiza a prop `impactText` em um elemento visualmente distinto de `description` (ex.: `data-testid="portfolio-impact-text"`), (b) o card sem `impactText` continua renderizando normalmente (retrocompatibilidade com os demais cards do portfólio)

### Implementation for User Story 1

- [X] T002 [P] [US1] Atualizar `portfolio.projects.chatAssistant.title` para `"InterasisAI Connect"` e adicionar a chave `portfolio.projects.chatAssistant.impactText` em `src/i18n/locales/pt-BR/home.json`
- [X] T003 [P] [US1] Idem (título de marca idêntico + `impactText` traduzido) em `src/i18n/locales/en/home.json`
- [X] T004 [P] [US1] Idem (título de marca idêntico + `impactText` traduzido) em `src/i18n/locales/es/home.json`
- [X] T005 [US1] Adicionar a prop `impactText?: string` a `PortfolioCardProps` e renderizá-la (com `data-testid="portfolio-impact-text"`, estilo visualmente distinto de `description`) em `src/components/ui/PortfolioCard.tsx` (faz T001 passar)
- [X] T006 [US1] Passar `impactText: t("portfolio.projects.chatAssistant.impactText")` no objeto do case `chatAssistant` em `src/components/ui/PortfolioSection.tsx` (depende de T002-T005)

**Checkpoint**: Nome novo e texto de impacto visíveis nos 3 idiomas; `PortfolioCard.test.tsx` passa; nenhum outro card do portfólio é afetado.

---

## Phase 2: User Story 2 - Explorar e compartilhar o valor do produto pela página "Saiba mais" (Priority: P1) 🎯 MVP (parte 2/2)

**Goal**: Um botão "Saiba mais" ao lado de "Testar Assistente ao Vivo" navega para uma página própria e compartilhável (`/{locale}/interasisai-connect`), com metadados de SEO/Open Graph e dados estruturados específicos, listada no `sitemap.ts` e acessível diretamente por URL.

**Independent Test**: Clicar em "Saiba mais" a partir do card navega para a nova URL; abrir essa URL diretamente (sem passar pela landing page) também funciona; os metadados (title/description/OG) e os dados estruturados (JSON-LD) da página são específicos do produto e válidos.

### Tests for User Story 2 ⚠️

> Escrever estes testes primeiro; devem falhar antes da implementação.

- [X] T007 [US2] Escrever teste RTL em `src/components/ui/PortfolioCard.test.tsx` cobrindo: o link "Saiba mais" só renderiza quando `learnMoreLabel` e `learnMoreHref` são fornecidos, e aponta (`href`) para o valor de `learnMoreHref` recebido
- [X] T008 [US2] Escrever teste RTL em `src/components/connect/ConnectPage.test.tsx` cobrindo: a página renderiza `eyebrow`/`title`/`lead`, a seção de arquitetura, a tabela comparativa, os passos e o CTA a partir do `content` recebido (sem depender ainda das abas de vertical, cobertas na US3)
- [X] T009 [US2] Escrever teste unitário em `src/components/connect/connectStructuredData.test.ts` cobrindo: `buildConnectServiceJsonLd` retorna um objeto com `"@type": "Service"`, `name`, `description` e `provider.name` preenchidos a partir dos parâmetros; `buildConnectBreadcrumbJsonLd` retorna um `"@type": "BreadcrumbList"` com exatamente 2 itens (Home, InterasisAI Connect) nas posições corretas

### Implementation for User Story 2

- [X] T010 [P] [US2] Criar `src/i18n/locales/pt-BR/connect.json` com o namespace `connect` completo (exceto `verticals`, coberto na US3): `metadata.title`, `metadata.description`, `eyebrow`, `title`, `lead`, `comparisonLabels`, `architecture`, `comparisonTable`, `steps`, `cta` — conteúdo adaptado de `apresentacao-interasisconnect.html` (sem dados de cliente real, FR-011)
- [X] T011 [P] [US2] Idem traduzido em `src/i18n/locales/en/connect.json`
- [X] T012 [P] [US2] Idem traduzido em `src/i18n/locales/es/connect.json`
- [X] T013 [US2] Registrar o novo namespace em `src/i18n/request.ts`: `connect: (await import(\`./locales/${locale}/connect.json\`)).default` (depende de T010-T012 existirem para não quebrar o import)
- [X] T014 [P] [US2] Adicionar a chave `portfolio.actions.learnMore` em `src/i18n/locales/{pt-BR,en,es}/home.json` (3 arquivos)
- [X] T015 [P] [US2] Criar `src/components/connect/types.ts` com os tipos `ConnectPageContent` e `VerticalScenario` conforme `specs/027-interasisai-connect-modal/data-model.md` e `contracts/ui-contracts.md`
- [X] T016 [P] [US2] Criar `src/components/connect/connectStructuredData.ts` com `buildConnectServiceJsonLd` e `buildConnectBreadcrumbJsonLd`, seguindo o mesmo padrão de objeto plano usado por `organizationJsonLd` em `src/app/[locale]/layout.tsx` (depende de T015 para os tipos de entrada; faz T009 passar)
- [X] T017 [US2] Implementar `src/components/connect/ConnectPage.tsx` (server component de apresentação): renderiza `eyebrow`/`title` (`<h1>`)/`lead`, seção de arquitetura (`<h2>`), tabela comparativa (`<h2>` + `<table>`), passos (`<h2>` + lista) e bloco de CTA com `PortfolioOpenChatButton`; por ora renderiza um placeholder estático no lugar do comparativo de verticais (implementado na US3) (depende de T015; faz T008 passar)
- [X] T018 [US2] Criar `src/app/[locale]/interasisai-connect/page.tsx`: `generateMetadata` (title/description/alternates/openGraph a partir do namespace `connect`, com a constante `CONNECT_OG_IMAGE` apontando para `/images/interasisai-connect-cover.png` com fallback para `/images/interasisai_coverpage.png` — FR-015) e o componente de página chamando `getTranslations({ locale, namespace: "connect" })`, renderizando `<ConnectPage content={...} ctaButtonLabel={...} />` e os dois `<script type="application/ld+json">` de `connectStructuredData.ts` (FR-013, FR-014), seguindo o padrão de `src/app/[locale]/sobre/page.tsx` (depende de T013, T016, T017)
- [X] T019 [US2] Adicionar a rota `{ path: "/interasisai-connect", priority: 0.7, changeFrequency: "monthly" }` ao array `ROUTES` em `src/app/sitemap.ts`
- [X] T020 [US2] Adicionar as props `learnMoreLabel?: string` e `learnMoreHref?: string` a `PortfolioCardProps`, renderizando um link `next/link` "Saiba mais" ao lado do botão de ação existente no rodapé do card em `src/components/ui/PortfolioCard.tsx`, apenas quando ambas as props estiverem presentes (depende de T005 no mesmo arquivo; faz T007 passar)
- [X] T021 [US2] Em `src/components/ui/PortfolioSection.tsx`: chamar `getLocale()` de `next-intl/server`, montar `learnMoreHref={`/${locale}/interasisai-connect`}` e passar `learnMoreLabel`/`learnMoreHref` no case `chatAssistant` (depende de T006, T014, T020)

**Checkpoint**: Botão "Saiba mais" navega para a página de valor nos 3 idiomas, com metadados e dados estruturados próprios, listada no sitemap. Neste ponto, o MVP (US1+US2) já é demonstrável, compartilhável e reforçado para SEO (ainda sem a interatividade das 5 verticais).

---

## Phase 3: User Story 3 - Comparar o produto pelo cenário do próprio segmento (Priority: P2)

**Goal**: Na página de valor, alternar entre 5 abas de vertical de negócio atualiza a simulação de conversa e os vereditos, replicando a interatividade do material de referência.

**Independent Test**: Na página de valor (US2 já funcional), clicar em cada uma das 5 abas de vertical e confirmar que a simulação de conversa e o veredito de cada lado mudam, sem navegar para outra URL; a troca também funciona por teclado.

### Tests for User Story 3 ⚠️

> Escrever estes testes primeiro; devem falhar antes da implementação.

- [X] T022 [US3] Criar `src/components/connect/ConnectVerticalComparison.test.tsx` cobrindo: renderiza 5 abas de vertical com a primeira (`buffet`) ativa por padrão; clicar em cada uma das outras 4 atualiza a simulação de conversa e os vereditos exibidos; navegação por teclado (Tab/Enter) entre abas produz o mesmo resultado que o clique; nenhuma navegação de página ocorre durante a troca

### Implementation for User Story 3

- [X] T023 [P] [US3] Adicionar os 5 itens de `connect.verticals[]` (`buffet`, `clinica`, `escola`, `imob`, `rh`, cada um com `tabLabel`, `customerQuestion`, `followUpQuestion`, `commonReply1/2`, `connectReply1/2`, `commonVerdict`, `connectVerdict`) em `src/i18n/locales/pt-BR/connect.json`, adaptando o tom de `apresentacao-interasisconnect.html` sem dados de cliente real
- [X] T024 [P] [US3] Idem traduzido em `src/i18n/locales/en/connect.json`
- [X] T025 [P] [US3] Idem traduzido em `src/i18n/locales/es/connect.json`
- [X] T026 [US3] Implementar `src/components/connect/ConnectVerticalComparison.tsx` (`"use client"`): estado local de aba ativa (`useState<VerticalScenario["id"]>`, padrão `verticals[0].id`), UI de abas acessível (`role="tablist"`/`role="tab"`, navegável por teclado) e render da simulação de conversa/vereditos conforme a vertical ativa (depende de T015, T023-T025; faz T022 passar)
- [X] T027 [US3] Substituir o placeholder de T017 em `src/components/connect/ConnectPage.tsx` por `<ConnectVerticalComparison verticals={content.verticals} labels={content.comparisonLabels} />` (depende de T017, T026)

**Checkpoint**: Todas as 3 user stories funcionam de forma independente e combinada, cobrindo o material de referência completo.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Garantias que atravessam as 3 user stories.

- [X] T028 [P] Criar teste de paridade de chaves i18n em `src/i18n/locales/__tests__/connect-parity.test.ts`, garantindo que `pt-BR/connect.json`, `en/connect.json` e `es/connect.json` têm exatamente o mesmo conjunto de chaves (incluindo `verticals`), evitando divergência silenciosa entre idiomas
- [X] T029 Executar manualmente o checklist de `specs/027-interasisai-connect-modal/quickstart.md` (3 idiomas, acesso direto por URL, metadados/OG, dados estruturados, mobile, teclado, sitemap) — verificado via `curl` contra o dev server já em execução (título/description/OG/JSON-LD corretos em pt-BR/en/es, card da home com novo nome/impactText/link, sitemap com a nova rota)
- [X] T030 [P] Revisar acessibilidade final dos componentes alterados/criados (reforçada com `/web-design-guidelines`): adicionados cabeçalhos de coluna (`<thead>`) na tabela comparativa, e o padrão ARIA completo de tabs em `ConnectVerticalComparison` (`aria-controls`/`role="tabpanel"`/roving `tabIndex` com navegação por setas, Home/End)
- [X] T031 Rodar `npm run lint` e `npm test` e confirmar zero regressões nos demais cards de portfólio, nas demais páginas institucionais e no fluxo existente de "Testar Assistente ao Vivo" — 699/707 testes passando, as 6 suítes com falha (8 testes) são pré-existentes e não relacionadas (confirmado via `git stash`); `tsc --noEmit` e `eslint` sem erros nos arquivos novos/alterados

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: Sem dependências — pode começar imediatamente.
- **User Story 2 (Phase 2)**: Depende de T005/T006 (US1) apenas porque edita os mesmos arquivos (`PortfolioCard.tsx`, `PortfolioSection.tsx`); não depende funcionalmente do texto de impacto.
- **User Story 3 (Phase 3)**: Depende de T015/T017 (tipos + página implementadas em US2); é uma extensão aditiva da mesma página.
- **Polish (Phase 4)**: Depende de US1, US2 e US3 completas.

### Parallel Opportunities

- T002, T003, T004 (i18n de US1 em 3 locales) — paralelas entre si.
- T010, T011, T012 (novo `connect.json` em 3 locales), T014 (i18n de US2 em `home.json`), T015 (tipos) e T016 (JSON-LD) — paralelas entre si.
- T023, T024, T025 (`verticals` em 3 locales) — paralelas entre si.
- T028 e T030 (Polish) — paralelas entre si.

---

## Parallel Example: User Story 2

```bash
# Após T007/T008/T009 (testes) escritos e falhando:
Task: "Criar src/i18n/locales/pt-BR/connect.json com o conteúdo da página (sem verticals)"
Task: "Criar src/i18n/locales/en/connect.json com o conteúdo da página (sem verticals)"
Task: "Criar src/i18n/locales/es/connect.json com o conteúdo da página (sem verticals)"
Task: "Adicionar portfolio.actions.learnMore nos 3 home.json"
Task: "Criar src/components/connect/types.ts"
Task: "Criar src/components/connect/connectStructuredData.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 — ambas P1)

1. Completar Phase 1 (US1): novo nome + texto de impacto.
2. Completar Phase 2 (US2): botão "Saiba mais" navegando para a página de valor, com SEO/OG/JSON-LD próprios e conteúdo estático (sem abas de vertical ainda).
3. **PARAR e VALIDAR**: rodar os passos 1-6, 8-9, 12-14 do `quickstart.md`.
4. Este ponto já é um MVP demonstrável, compartilhável, reforçado para SEO e alinhado ao pedido original.

### Incremental Delivery

1. US1 → US2 (MVP completo, ambas P1).
2. US3 (P2): adiciona a interatividade das 5 verticais sobre a página já publicada, sem quebrar US1/US2.
3. Polish: paridade de i18n, acessibilidade e regressão.

## Notes

- Nenhuma task de implementação foi escrita antes de sua(s) task(s) de teste correspondente(s), conforme Princípio IV (NON-NEGOTIABLE) da constituição do projeto.
- Nenhuma alteração de backend/API é necessária — todas as tasks são de frontend (rota Next.js + componentes React + catálogos de i18n).
- A imagem de Open Graph dedicada (`interasisai-connect-cover.png`) é um ativo de design pendente de entrega pelo solicitante; T018 já implementa o fallback (FR-015) para não bloquear o lançamento.
- Implementação aguarda liberação explícita do solicitante (guidelines adicionais), conforme registrado no ticket [EDI-70](https://linear.app/edilsonandrade/issue/EDI-70/landing-page-renomear-card-para-interasisai-connect-e-criar-pagina).
- **2026-08-30, pós-implementação**: refinamento visual em T026 a pedido do solicitante, após comparação com o print do material de referência — `ConnectVerticalComparison` passou de duas caixas simples com uma pergunta compartilhada para duas colunas completas lado a lado (thread de chat repetida em cada lado, como no HTML de referência), cada uma com cabeçalho + selo (`comparisonBadges`, novo campo) para deixar óbvio à primeira vista que a coluna esquerda é um "Chatbot comum" e a direita é o InterasisAI Connect. `data-model.md`/`contracts/ui-contracts.md` atualizados; testes reescritos e passando.
- **2026-08-30, pós-implementação (2)**: destaque de texto no `<h1>` da página (fragmentos "oferece opções." / "já sabe a resposta." em `text-brand-primary`, replicando o `<em>` dourado do material de referência) e uma linha final de destaque na seção de arquitetura (`architecture.highlight`, ex.: "Mudou um preço? Você troca o documento."). Implementado via `t.rich("title", { em: ... })` do next-intl (não com `t()` simples — mensagens com tags `<em>` exigem `t.rich`, senão o next-intl falha silenciosamente e renderiza a chave crua; isso foi detectado e corrigido durante a validação ao vivo). `ConnectPageContent.title` passou de `string` para `ReactNode` por causa disso.
