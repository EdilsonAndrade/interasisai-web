---
description: "Task list for feature 009-homepage-logo-and"
---

# Tasks: Posicionamento do Logo e Cover Page na Home

**Input**: Design documents from `/specs/009-homepage-logo-and/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Constitution principle IV (NON-NEGOTIABLE) requires unit/component tests for every interactive component and hook. Test tasks are therefore included.

**Organization**: Tasks são agrupadas por user story (US1 hero, US2 header/footer, US3 OG/favicon) para permitir entrega incremental. US1 sozinha já é MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: vínculo com a user story (US1, US2, US3)
- Caminhos de arquivo absolutos no repositório

## Path Conventions

- Frontend Next.js (App Router) — código em `src/`, ativos em `public/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capturar metadados dos ativos e preparar o terreno.

- [X]  Inferir e registrar dimensões nativas (W×H) de `public/images/interasis_ai_logo.png` e `public/images/interasisai_coverpage.png` (via Node/sharp ou inspeção do navegador, conforme [quickstart.md §1](./quickstart.md)) e atualizar a seção "Instâncias" de [data-model.md](./data-model.md) com os valores reais.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Componente atômico de marca reutilizável + favicons globais. Devem existir antes que US1/US2/US3 possam ser concluídas, pois US2 depende do componente e US3 depende dos arquivos de ícone.

**⚠️ CRITICAL**: T002–T005 bloqueiam US2; T006 bloqueia US3.

- [X]  [P] Criar testes do componente `BrandLogo` em `src/components/ui/BrandLogo.test.tsx` cobrindo: (a) `variant="header"` com `href="/"` produz um único accessible name "Interasis AI - Página inicial"; (b) `variant="header"` sem `href` renderiza imagem com `alt="Interasis AI"`; (c) `variant="footer"` renderiza imagem com `alt="Interasis AI"` na altura prevista; (d) `fireEvent.error` na imagem aciona fallback textual "Interasis AI"; (e) `className` adicional é mesclada via `tailwind-merge`. Mock de `next/image` se necessário (ver `jest.setup.ts`).
- [X]  Implementar componente `BrandLogo` em `src/components/ui/BrandLogo.tsx`: props `{ variant: "header" | "footer"; className?: string; href?: string }`; usa `next/image` com `width`/`height` derivados das dimensões nativas (T001) preservando proporção e altura final 36px (header) / 52px (footer); quando `href` está presente, envolve em `next/link` com `aria-label="Interasis AI - Página inicial"` e imagem com `alt=""`; estado interno `errored` ativado por `onError` que renderiza fallback `<span>Interasis AI</span>` com a tipografia equivalente. Sem `any`. Tornar T002 verde.
- [X]  [P] Criar `src/app/icon.png` como cópia/redimensionamento de `public/images/interasis_ai_logo.png` (32×32 ou tamanho original quadrado — Next.js gera variantes). Não alterar o original em `public/images/`.
- [X]  [P] Criar `src/app/apple-icon.png` (180×180) a partir do logotipo oficial. Não alterar o original em `public/images/`.
- [X]  [P] Verificar/ajustar `next.config.ts` para garantir que `images` aceita o domínio local (padrão) e que formatos modernos (`avif`, `webp`) estão habilitados (config padrão do Next 15 já cobre — só registrar verificação no PR).

**Checkpoint**: Componente `BrandLogo` testado e verde; arquivos de ícone presentes; configuração de imagens validada → US1, US2 e US3 podem prosseguir em paralelo.

---

## Phase 3: User Story 1 - Primeira impressão de marca no hero (Priority: P1) 🎯 MVP

**Goal**: Hero da home exibe a cover page integrada ao gradiente em layout 2 colunas (desktop) / empilhado (mobile), sem regressão de LCP/CLS e mantendo H1, subtítulo e CTAs intactos.

**Independent Test**: Carregar `/` em 375px e 1280px; verificar que (a) `getByRole("img", { name: /Inteligência que conecta/i })` está no hero; (b) H1 e CTAs presentes e clicáveis; (c) Lighthouse mobile mantém LCP ≤2,5s e CLS <0,1.

### Tests for User Story 1

- [X]  [P] [US1] Atualizar `src/app/page.test.tsx` adicionando asserts: (a) imagem da cover está no `data-testid="hero-section"` com `alt` em pt-BR contendo "Inteligência que conecta. Tecnologia que transforma."; (b) H1 e CTAs `cta-primary` / `cta-secondary` continuam presentes (não regredir asserts existentes); (c) `metadata` exportado de `page.tsx` contém `openGraph.images[0]` com `url` apontando para `/images/interasisai_coverpage.png`, `width: 1200`, `height: 630` e `alt` não vazio em pt-BR.

### Implementation for User Story 1

- [X]  [US1] Editar `src/app/page.tsx` no bloco do hero (`data-testid="hero-section"`): introduzir grid de 2 colunas em `lg:` (texto col-span-7 / cover col-span-5) e empilhamento `flex-col` em `<lg`; o bloco texto (badge, H1, subtítulo, CTAs) permanece à esquerda. Adicionar `<Image src="/images/interasisai_coverpage.png" />` com `priority`, `sizes="(min-width: 1024px) 50vw, 100vw"`, `width`/`height` nativos (T001) e `alt` igual ao definido em [data-model.md](./data-model.md) §COVER. Aplicar wrapper Tailwind com `mask-[radial-gradient(...)]` (ou utilitária equivalente) para dissolver o fundo branco do PNG nas bordas e harmonizar com `bg-gradient-hero`. Em mobile, limitar altura via `max-h-[45vh]` e `object-contain`. Preservar `FadeIn` existente como wrapper.
- [X]  [US1] No mesmo `src/app/page.tsx`, exportar/atualizar `metadata.openGraph.images = [{ url: "/images/interasisai_coverpage.png", width: 1200, height: 630, alt: "Interasis AI — Inteligência que conecta. Tecnologia que transforma." }]` e adicionar `twitter: { card: "summary_large_image", images: [...] }` espelhando o OG. Tornar T007 verde.
- [X]  [US1] Garantir robustez: no JSX do hero, envolver a `<Image />` da cover em wrapper que oculta a imagem (via state ou CSS) quando `onError` dispara, deixando o gradiente visível (cumpre FR-019). Atualizar `page.test.tsx` se necessário com um caso de fallback (ou cobrir esse cenário em teste dedicado de hero).

**Checkpoint**: Home carrega com cover composta; testes passam; LCP/CLS validados manualmente via Lighthouse (quickstart §9). MVP entregável.

---

## Phase 4: User Story 2 - Identidade persistente em header e footer (Priority: P2)

**Goal**: Substituir o texto "Interasis AI" no header e a `<h2>` no footer pelo componente `BrandLogo` oficial, mantendo navegação, tema toggle e demais conteúdos intactos.

**Independent Test**: Renderizar `Header` e `Footer` isoladamente e verificar que o logotipo aparece com altura controlada, link do header leva à raiz e nenhum nome acessível duplicado é anunciado.

### Tests for User Story 2

- [X]  [P] [US2] Atualizar `src/components/layout/Header.test.tsx`: substituir o assert `getByRole("link", { name: "Interasis AI" })` por `getByRole("link", { name: "Interasis AI - Página inicial" })`; assertar que o link envolve uma imagem (via `getByRole("img", { hidden: true })` ou consultando o `<a>` ancestral); preservar asserts existentes de navegação e toggle.
- [X]  [P] [US2] Atualizar `src/components/layout/Footer.test.tsx`: assertar que existe `getByAltText("Interasis AI")` dentro do `<footer>`; preservar asserts existentes (`contato@interasis.ai`, ano dinâmico, links institucionais).

### Implementation for User Story 2

- [X]  [US2] Editar `src/components/layout/Header.tsx`: substituir o `<a href="#top" ...>Interasis AI</a>` por `<BrandLogo variant="header" href="/" />` (importar de `@/components/ui/BrandLogo`). Manter o restante (nav, toggle de tema, CTA, menu mobile). Tornar T011 verde.
- [X]  [US2] Editar `src/components/layout/Footer.tsx`: substituir a `<h2 className="text-xl font-bold">Interasis AI</h2>` por `<BrandLogo variant="footer" />` envolvido por `<h2 className="sr-only">Interasis AI</h2>` (ou solução equivalente que preserve hierarquia semântica sem duplicar texto visível) — alternativa: manter `<h2>` apenas para SR e exibir o logo visualmente. Garantir contraste AA contra `bg-brand-secondary`. Tornar T012 verde.

**Checkpoint**: Header e Footer com identidade visual oficial; testes verdes; nenhuma regressão funcional.

---

## Phase 5: User Story 3 - Marca compartilhável (favicon, OG image, PWA) (Priority: P3)

**Goal**: Garantir que compartilhamentos e fixação em aba/tela inicial exibem a identidade oficial da marca.

**Independent Test**: `curl http://localhost:3000 | grep og:image` retorna a cover; o favicon aparece na aba; LinkedIn/WhatsApp/X mostram a cover na pré-visualização.

### Tests for User Story 3

- [X]  [P] [US3] Verificar (manual ou via teste de smoke) que `<head>` da home renderiza tags `<meta property="og:image">`, `<meta property="og:image:width">`, `<meta property="og:image:height">`, `<meta property="og:image:alt">` e `<meta name="twitter:card" content="summary_large_image">`. Cobertura primária já é T007 (asserts no `metadata` exportado).

### Implementation for User Story 3

- [X]  [US3] Os arquivos `src/app/icon.png` (T004) e `src/app/apple-icon.png` (T005) já habilitam favicons via convenção do Next. Validar manualmente conforme [quickstart.md §8](./quickstart.md) que o ícone aparece na aba e em "adicionar à tela inicial" (iOS).
- [X]  [US3] (Opcional) Atualizar `metadata` global em `src/app/layout.tsx` para incluir `openGraph.images` fallback apontando para a cover, garantindo que páginas futuras sem override também tenham OG image — sem alterar o `title`/`description` existentes.

**Checkpoint**: Pré-visualizações de compartilhamento e favicons exibem a identidade oficial em todos os canais validados.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validações finais e auditorias de qualidade.

- [ ] T018 [P] Rodar `npm run lint` e corrigir quaisquer avisos introduzidos pelos novos arquivos (`BrandLogo.tsx`, edits em `page.tsx`, `Header.tsx`, `Footer.tsx`).
- [ ] T019 [P] Rodar `npm test -- --watch=false` e garantir 100% verde, sem regressão em `ChatWidget`, `useChatAssistant`, `chatGateway`, etc.
- [ ] T020 Executar Lighthouse mobile (quickstart §9) em build de produção (`npm run build && npm run start`) e anexar ao PR os valores: LCP, CLS, Performance score, Accessibility score. Confirmar SC-002 (LCP ≤2,5s, ΔLCP <200ms vs. baseline) e SC-003 (CLS <0,1, hero <0,05).
- [ ] T021 Executar auditoria axe DevTools / Lighthouse Accessibility (≥95) em `/` e validar SC-004 (alt em pt-BR, contraste AA).
- [ ] T022 Executar cenários de degradação (quickstart §10): renomear temporariamente cada ativo em `public/images/` e validar fallbacks (FR-019). Restaurar após.
- [ ] T023 Atualizar o PR com (a) screenshots em 375/768/1280px; (b) métricas de Lighthouse antes/depois; (c) checklist final de [quickstart.md §12](./quickstart.md).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: T001 — sem dependências.
- **Phase 2 (Foundational)**: T002–T006 — depende de T001 (dimensões usadas em T003). T004/T005/T006 podem iniciar em paralelo a T002/T003 pois não dependem de dimensões.
- **Phase 3 (US1)**: depende de T001 (dimensões). NÃO depende de T003 (BrandLogo) — pode iniciar em paralelo com Phase 2 após T001.
- **Phase 4 (US2)**: depende de T003 (BrandLogo implementado).
- **Phase 5 (US3)**: depende de T004 e T005 (favicons) e de T009 (metadata OG na home, em US1) para validação completa.
- **Phase 6 (Polish)**: depende da conclusão das fases anteriores que serão entregues.

### User Story Dependencies

- **US1 (P1)**: depende apenas de T001. Pode ser entregue como MVP independente.
- **US2 (P2)**: depende de Foundational (T002–T003).
- **US3 (P3)**: depende de Foundational (T004, T005) e do `metadata.openGraph.images` definido em T009 (US1).

### Within Each User Story

- Testes primeiro (TDD leve quando aplicável): T002 antes de T003; T007 antes de T008/T009; T011/T012 antes de T013/T014.
- T010 depende de T008.
- T013 depende de T003 e T011.
- T014 depende de T003 e T012.

### Parallel Opportunities

- T004, T005, T006 (Foundational) podem rodar em paralelo entre si e em paralelo a T002/T003 (após T001).
- Após Phase 2 + T001, US1/US2/US3 podem ser desenvolvidas em paralelo por desenvolvedores diferentes (cada uma toca arquivos distintos).
- Dentro de US2, T011 e T012 são independentes (arquivos diferentes), assim como T013 e T014.
- T018 e T019 são paralelizáveis em Phase 6.

---

## Parallel Example: Foundational

```text
# Após T001 concluída, iniciar em paralelo:
T002 (BrandLogo.test.tsx)   ← arquivo novo
T004 (src/app/icon.png)      ← arquivo novo
T005 (src/app/apple-icon.png)← arquivo novo
T006 (verificação next.config)← read-only
# Em seguida, T003 (BrandLogo.tsx) torna T002 verde.
```

## Parallel Example: User Stories Após Foundational

```text
# Em paralelo:
US1: T007 → T008 → T009 → T010
US2: (T011 ∥ T012) → (T013 ∥ T014)
US3: T015 → T016 → T017
```

---

## Implementation Strategy

### MVP scope (sugerido)

Entregar **apenas US1 (Phases 1 + 3 + tarefas mínimas de Phase 6)** como primeira release. Já cumpre o objetivo principal de impacto visual moderno na home e desbloqueia validação de mercado. US2 e US3 são amplificações.

### Incremento 1 (MVP)

1. T001 (Setup)
2. T007 → T008 → T009 → T010 (US1)
3. T018, T019, T020 (Polish mínimo)

### Incremento 2

- US2: T002, T003 (Foundational componente) → T011, T012 → T013, T014.

### Incremento 3

- US3: T004, T005, T006 → T015, T016, T017.

### Incremento final

- Polish completo (T021, T022, T023).

---

## Format Validation

Todas as tasks acima seguem o formato obrigatório `- [ ] T### [P?] [Story?] Description with file path`:

- ✅ Todas iniciam com `- [ ]`.
- ✅ IDs sequenciais T001–T023.
- ✅ `[P]` aplicado apenas onde há paralelismo real (arquivos distintos, sem dependência pendente).
- ✅ `[USx]` aplicado apenas em tasks de Phase 3, 4 e 5.
- ✅ Setup (Phase 1), Foundational (Phase 2) e Polish (Phase 6) sem label de story.
- ✅ Cada task referencia caminho explícito no repositório.
