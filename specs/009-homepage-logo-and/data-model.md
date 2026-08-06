# Phase 1 — Data Model: Brand Assets & Brand Surfaces

**Feature**: 009-homepage-logo-and
**Date**: 2026-04-30

Esta feature é puramente apresentacional e **não persiste dados em runtime**. As "entidades" abaixo descrevem o modelo conceitual usado para configurar o componente `BrandLogo` e os metadados (Open Graph, favicons), garantindo consistência entre superfícies.

## Entidade: BrandAsset

Representa um arquivo de imagem oficial da marca disponível em `public/images/`.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `"logo" \| "cover"` | sim | Identificador lógico do ativo. |
| `publicPath` | `string` | sim | Caminho público absoluto, ex.: `/images/interasis_ai_logo.png`. |
| `nativeWidth` | `number` | sim | Largura nativa em pixels (a confirmar empiricamente no quickstart). |
| `nativeHeight` | `number` | sim | Altura nativa em pixels. |
| `defaultAlt` | `string` (pt-BR) | sim | Texto alternativo padrão. |
| `usageContexts` | `BrandSurfaceId[]` | sim | Lista de superfícies onde o ativo pode ser usado. |

**Instâncias**:

```ts
const LOGO: BrandAsset = {
  id: "logo",
  publicPath: "/images/interasis_ai_logo.png",
  nativeWidth: 1536,
  nativeHeight: 1024,
  defaultAlt: "Interasis AI",
  usageContexts: ["header", "footer", "favicon"],
};

const COVER: BrandAsset = {
  id: "cover",
  publicPath: "/images/interasisai_coverpage.png",
  nativeWidth: 1983,
  nativeHeight: 793,
  defaultAlt:
    "Interasis AI — Inteligência que conecta. Tecnologia que transforma. Ilustração de cabeça humana estilizada em circuitos.",
  usageContexts: ["hero", "og"],
};
```

### Regras de validação

- `publicPath` DEVE iniciar com `/images/` e referenciar arquivo existente em `public/images/` (FR-020).
- `nativeWidth > 0` e `nativeHeight > 0`.
- `defaultAlt` DEVE estar em pt-BR e não pode ser vazio para usos não decorativos (FR-017).

## Entidade: BrandSurface

Representa um lugar concreto na UI/metadados onde um `BrandAsset` é renderizado.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `"hero" \| "header" \| "footer" \| "og" \| "favicon"` | sim | Identificador da superfície. |
| `asset` | `BrandAsset["id"]` | sim | Ativo associado. |
| `renderHeightPx` | `number \| null` | depende | Altura renderizada (px). `null` para superfícies não-pixel-based (`og`, `favicon` sob convenção do Next). |
| `breakpointRules` | `BreakpointRule[]` | sim | Regras por viewport. |
| `accessibility` | `A11yRule` | sim | Requisitos de acessibilidade aplicáveis. |
| `fallback` | `"text" \| "none"` | sim | Comportamento em caso de falha de carregamento. |

### Instâncias

#### `header`

- `asset`: `"logo"`
- `renderHeightPx`: `36` (faixa permitida 32–40 pelo FR-008)
- `breakpointRules`: única regra — altura constante em todos os breakpoints.
- `accessibility`:
  - link wrapper com `aria-label="Interasis AI - Página inicial"`
  - imagem com `alt=""` (decorativa por estar dentro de link rotulado)
- `fallback`: `"text"` → renderiza `<span>Interasis AI</span>` se `onError` disparar (FR-019).

#### `footer`

- `asset`: `"logo"`
- `renderHeightPx`: `52` (faixa permitida 48–56 pelo FR-010)
- `breakpointRules`: única regra — altura constante.
- `accessibility`:
  - imagem com `alt="Interasis AI"`
  - contraste mínimo AA contra `bg-brand-secondary` (FR-011)
- `fallback`: `"text"` → mantém `<h2>Interasis AI</h2>` existente.

#### `hero`

- `asset`: `"cover"`
- `renderHeightPx`: `null` (largura responsiva via `sizes`; altura via `aspect-ratio`)
- `breakpointRules`:
  - `< 1024px`: posição = empilhada (abaixo do bloco texto), largura = 100% da coluna, altura ≤ 45vh, `object-fit: cover`, `object-position: center`.
  - `≥ 1024px`: posição = coluna direita (col-span 5/12), `aspect-ratio` nativo do PNG, máscara radial para dissolver fundo branco nas bordas.
- `accessibility`:
  - `alt = COVER.defaultAlt` (pt-BR)
  - nenhum overlay sobre H1/CTAs (FR-006)
- `fallback`: `"none"` → hero exibe apenas gradiente atual (FR-019).

#### `og`

- `asset`: `"cover"`
- `renderHeightPx`: `null`
- `breakpointRules`: N/A (metadado).
- Configuração: `metadata.openGraph.images = [{ url: "/images/interasisai_coverpage.png", width: 1200, height: 630, alt: COVER.defaultAlt }]` em `src/app/page.tsx`.
- `accessibility`: `alt` em pt-BR no metadado.
- `fallback`: `"none"`.

#### `favicon`

- `asset`: `"logo"`
- Implementação via convenção do Next.js: `src/app/icon.png` (32px) e `src/app/apple-icon.png` (180px) — Next gera tags `<link>` automaticamente.
- `accessibility`: N/A para favicon (browser-managed).
- `fallback`: `"none"` (Next aplica o favicon padrão se ausente, mas o spec exige presença — FR-012).

## Tipos TypeScript (referência para implementação)

```ts
export type BrandAssetId = "logo" | "cover";
export type BrandSurfaceId = "hero" | "header" | "footer" | "og" | "favicon";

export interface BrandLogoVariantConfig {
  heightPx: number;
  width: number;       // largura derivada da proporção do logo
  alt: string;
  decorativeInsideLink?: boolean;
}

// Exemplo do que vive em src/components/ui/BrandLogo.tsx (conceitual)
export interface BrandLogoProps {
  variant: "header" | "footer";
  className?: string;
  href?: string;       // se presente, envolve em next/link com aria-label
}
```

## Transições de estado

Apenas o componente `BrandLogo` mantém um estado mínimo de erro:

```text
[idle] --(image loads ok)--> [loaded]
[idle] --(onError event)--> [errored: render text fallback]
```

Sem transições reversas (não tentar recarregar). O fallback é definitivo dentro do ciclo de vida da página.

## Relacionamentos

- `BrandSurface (1) ── (1) BrandAsset` (cada superfície usa exatamente 1 ativo).
- `BrandAsset (1) ── (N) BrandSurface` (cada ativo é usado em ≥1 superfície).

Sem persistência: tudo é configuração estática em código.
