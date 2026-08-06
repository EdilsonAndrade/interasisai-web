# Implementation Plan: Posicionamento do Logo e Cover Page na Home

**Branch**: `009-homepage-logo-and` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-homepage-logo-and/spec.md`

## Summary

Posicionar os ativos visuais oficiais da Interasis AI (`interasis_ai_logo.png` e `interasisai_coverpage.png`) nas três superfícies-chave do site — **hero da home**, **header global**, **footer global** — além de configurar **OG image** e **favicons** para compartilhamento e identidade do navegador. Abordagem técnica: usar `next/image` com `priority` no hero (LCP), tamanho responsivo via `sizes`, layout em grade 2 colunas no hero (`lg`+) com fallback empilhado em mobile, máscara/gradient overlay para integrar a cover (PNG fundo branco) ao gradiente atual do hero, substituir o texto da marca no `Header`/`Footer` por um componente `BrandLogo` reutilizável com fallback gracioso para texto, e atualizar `metadata.openGraph.images` em `app/page.tsx` (e `layout.tsx` como fallback global). Sem alterar design tokens, paleta, tipografia, gradientes ou hierarquia de CTAs já existentes.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 15 (App Router)  
**Primary Dependencies**: Next.js (`next/image`), Tailwind CSS v3, Framer Motion (já encapsulado em `FadeIn`), `clsx` + `tailwind-merge`  
**Storage**: N/A (ativos estáticos em `public/images/`)  
**Testing**: Jest + React Testing Library (`jest.config.mjs`, `jest.setup.ts`)  
**Target Platform**: Web (Edge/SSR via Vercel; navegadores modernos; Lighthouse mobile como referência)  
**Project Type**: Single Next.js web frontend (App Router)  
**Performance Goals**: LCP ≤2,5s (mobile 4G), CLS hero <0,05, regressão de LCP <200ms vs. baseline atual  
**Constraints**: Tailwind only; sem libs DOM-manipulating; respeitar `prefers-reduced-motion`; alt texts pt-BR; contraste AA; não renomear arquivos-fonte em `public/images/`  
**Scale/Scope**: 3 superfícies on-page (hero, header, footer) + 1 metadado OG + favicons. 1 componente novo (`BrandLogo`), 4 arquivos editados (`page.tsx`, `Header.tsx`, `Footer.tsx`, `layout.tsx`). Sem novas rotas, sem alterações em `services/`, `hooks/`, `context/`.

## Constitution Check

Avaliação contra a constituição v1.0.0 (`.specify/memory/constitution.md`):

| Princípio | Status | Justificativa |
|---|---|---|
| I. Hooks/UI separation | ✅ PASS | Feature puramente apresentacional — sem lógica de negócio, sem fetch, sem estado complexo. |
| II. Context API state | ✅ PASS | Não introduz estado global. |
| III. DRY / Componentização | ✅ PASS | `BrandLogo` reutilizado em Header e Footer. Cover embutida diretamente no hero (uso único — pragmatismo). |
| IV. Testes unitários (NON-NEGOTIABLE) | ✅ PASS | RTL para `BrandLogo` (incluindo fallback `onError`); atualização de `Header.test.tsx`, `Footer.test.tsx`, `page.test.tsx`. |
| V. TypeScript / Errors | ✅ PASS | Sem `any`. Props tipadas. Erros de carga de imagem refletem em estado de fallback visível. |
| VI. Identidade visual | ✅ PASS | Tailwind only; gradientes/overlay via classes utilitárias; sem novas libs; `FadeIn` (Framer Motion) já existente é mantido; sem hover scale acima de 1.05. |
| VII. SEO / Semântica / a11y | ✅ PASS | `next/image` em todas as instâncias (princípio explícito); `alt` em pt-BR; hierarquia de headings preservada; `metadata.openGraph.images` adicionado. |
| VIII. Segurança | ✅ PASS | Sem `dangerouslySetInnerHTML`, sem novos inputs, sem novas chaves API, sem nova CSP necessária (imagens locais). |

**Resultado**: Nenhuma violação. Sem necessidade de justificativa de complexidade.

## Project Structure

### Documentation (this feature)

```text
specs/009-homepage-logo-and/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── brand-asset-placement-verification.md
└── tasks.md             # Gerado por /speckit.tasks (fora deste comando)
```

### Source Code (repository root)

```text
public/
└── images/
    ├── interasis_ai_logo.png        # já existente
    └── interasisai_coverpage.png    # já existente

src/
├── app/
│   ├── icon.png                     # NOVO (favicon via convenção Next.js)
│   ├── apple-icon.png               # NOVO (apple-touch-icon via convenção)
│   ├── layout.tsx                   # EDITAR: OG fallback global (opcional)
│   ├── page.tsx                     # EDITAR: hero em 2 colunas + cover via next/image + metadata.openGraph.images
│   └── page.test.tsx                # EDITAR: novos asserts (cover renderizada, alt)
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # EDITAR: <BrandLogo variant="header" href="/" />
│   │   ├── Header.test.tsx          # EDITAR: aria-label e ausência de texto duplicado
│   │   ├── Footer.tsx               # EDITAR: <BrandLogo variant="footer" />
│   │   └── Footer.test.tsx          # EDITAR: imagem com alt
│   └── ui/
│       ├── BrandLogo.tsx            # NOVO
│       └── BrandLogo.test.tsx       # NOVO
└── theme/                           # sem alterações
```

**Structure Decision**: Single project Next.js (App Router) já estabelecido. Esta feature é puramente de **camada de apresentação** — adiciona um componente de UI atômico (`BrandLogo`) e edita 4 arquivos existentes. Os ativos `.png` em `public/images/` permanecem inalterados; o pipeline `next/image` gera as variantes otimizadas automaticamente. Os favicons são adicionados via convenção zero-config do Next (`src/app/icon.png` e `src/app/apple-icon.png`).

## Complexity Tracking

> Não aplicável — Constitution Check passou sem violações.
