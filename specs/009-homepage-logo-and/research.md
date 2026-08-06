# Phase 0 — Research: Posicionamento do Logo e Cover Page na Home

**Feature**: 009-homepage-logo-and
**Date**: 2026-04-30

A especificação não contém marcações `[NEEDS CLARIFICATION]`. Esta pesquisa consolida decisões técnicas e de UX para guiar a Fase 1 (design) e a Fase 2 (tasks).

## 1. Componente de imagem (otimização e LCP)

- **Decisão**: Usar `next/image` (`<Image />`) em todas as instâncias.
- **Rationale**:
  - Princípio VII da constituição exige `next/image` para qualquer imagem renderizada.
  - Geração automática de AVIF/WebP com fallback PNG cobre FR-015.
  - Suporte nativo a `priority` (cover do hero) e `sizes` responsivo cobre FR-016.
  - Suporte a `placeholder="blur"` reduz CLS (FR-016, SC-003).
- **Alternativas consideradas**:
  - `<img>` HTML puro: rejeitado — viola constituição e impede otimização automática.
  - CSS `background-image`: rejeitado — não otimiza, não permite `alt`, prejudica a11y.

## 2. Layout do hero (composição texto + cover)

- **Decisão**: Grade 2 colunas em `lg:` (≥1024px) — texto/CTAs à esquerda (col-span-7), cover à direita (col-span-5). Em `<lg`, empilhar com cover **abaixo** do bloco texto para preservar LCP do H1.
- **Rationale**:
  - Padrão de mercado (Anthropic, Vercel, OpenAI, Cohere): hero "split" com asset visual à direita reforça marca sem competir com leitura.
  - Cover **abaixo** em mobile evita empurrar H1/CTAs para baixo da dobra (FR-003 + acceptance scenario US1.2).
  - Container existente `max-w-6xl` (96rem desktop) é mantido.
- **Alternativas consideradas**:
  - Cover de fundo full-bleed com texto sobreposto: rejeitado — risco a contraste (FR-006), exige overlay forte que apaga o protagonismo da imagem.
  - Cover acima em mobile: rejeitado — empurra H1 abaixo da dobra; pior para LCP percebido.

## 3. Integração da cover (fundo branco) ao gradiente do hero

- **Decisão**: Aplicar `mask-image` CSS com gradiente radial suave (centro opaco, bordas transparentes) + leve overlay de gradiente do hero translúcido sobreposto via pseudo-camada Tailwind (`before:` ou wrapper). A cover é colocada num container `relative` com `mix-blend-mode: multiply` desativado por padrão; em vez disso, usar máscara para dissolver o branco nas bordas.
- **Rationale**:
  - O PNG da cover tem fundo branco/claro com motion lines azuis/roxos — uma máscara radial dissolve a borda retangular dura (FR-004) sem alterar o arquivo-fonte (FR-020).
  - `mask-image` é GPU-friendly e funciona em Chrome/Edge/Safari/Firefox modernos.
  - Não requer Photoshop/edit do PNG.
- **Alternativas consideradas**:
  - Editar o PNG removendo o fundo: rejeitado — viola FR-020 (não renomear/alterar fonte).
  - `mix-blend-mode: multiply`: rejeitado — funciona apenas em fundos escuros e altera as cores da cabeça em circuitos.
  - Manter o retângulo branco: rejeitado — quebra o impacto "moderno e premium" exigido (SC-006).

## 4. Componente reutilizável `BrandLogo`

- **Decisão**: Criar `src/components/ui/BrandLogo.tsx` com props `{ variant: "header" | "footer"; className?: string; href?: string }`. Internamente usa `next/image` com tamanhos pré-configurados por variant (header: 36px de altura, footer: 52px). Quando `href` é fornecido, envolve em `<Link>` com `aria-label` apropriado e `alt=""` na imagem (para evitar duplicação para leitores de tela — FR-009).
- **Rationale**:
  - Princípio III (DRY): usado em ≥2 superfícies (Header e Footer).
  - Princípio I: componente puramente apresentacional.
  - Permite fallback textual via state interno (`onError` da `<Image />` → renderiza `<span>Interasis AI</span>` — FR-019).
- **Alternativas consideradas**:
  - Inserir `<Image />` diretamente em Header e Footer: rejeitado — duplica lógica de fallback e dimensões.
  - Componente em `components/layout/`: rejeitado — `BrandLogo` é um átomo de UI reutilizável, pertence a `components/ui/`.

## 5. Cover page no hero — sem componente reutilizável

- **Decisão**: Embutir a cover diretamente em `src/app/page.tsx` (uso único). Não criar `HeroCover` componente.
- **Rationale**:
  - Princípio III, mas com pragmatismo: criar abstração para um único uso é over-engineering (vide `<implementationDiscipline>`).
  - `next/image` já encapsula a otimização; o "componente" extra adicionaria apenas indireção.
- **Alternativas consideradas**:
  - Componente `HeroCover`: rejeitado por motivo acima.

## 6. Open Graph image

- **Decisão**: Definir `metadata.openGraph.images` em `src/app/page.tsx` (override por rota) apontando para `/images/interasisai_coverpage.png` com `width: 1200, height: 630, alt: "Interasis AI — Inteligência que conecta. Tecnologia que transforma."`. O `og:image` em `app/layout.tsx` (fallback global) também apontará para o mesmo asset.
- **Rationale**:
  - A cover já tem proporção wide adequada e contém marca + slogan — alinhada ao propósito de OG.
  - Next.js Metadata API renderiza tags OG automaticamente (FR-013, FR-014).
- **Alternativas consideradas**:
  - Gerar OG dinâmico via `opengraph-image.tsx` (Edge runtime): rejeitado — esforço desnecessário; o asset estático já cumpre o objetivo nesta iteração.
  - Renderizar apenas o logotipo: rejeitado — perde-se a riqueza visual da cover; pré-visualização ficaria menos impactante.

## 7. Favicon e ícones

- **Decisão**: Adicionar `src/app/icon.png` (cópia ou referência simbólica do logo redimensionada via Next.js convention) e `src/app/apple-icon.png`. Next.js detecta automaticamente esses arquivos e injeta `<link rel="icon">` e `<link rel="apple-touch-icon">`. Usar o `interasis_ai_logo.png` como fonte; Next.js redimensiona conforme arquivo declarado.
- **Rationale**:
  - Convenção zero-config do Next.js App Router (`app/icon.png`, `app/apple-icon.png`) é a abordagem mais simples (FR-012).
  - Não requer manifest customizado para favicon básico.
- **Alternativas consideradas**:
  - Manifest PWA completo com todos os tamanhos: rejeitado para esta iteração — escopo é o básico (16/32/180/512). PWA fica fora do escopo.
  - Gerar ícones via `next/image` em runtime: rejeitado — favicons devem ser estáticos para cache do navegador.

## 8. Testes de imagens em RTL

- **Decisão**: Em testes Jest, mockar `next/image` via `jest.mock("next/image", ...)` ou usar o mock global existente (verificar `jest.setup.ts`). Asserts focam em (a) `getByAltText("Interasis AI")` para logos; (b) `getByRole("img", { name: /Interasis AI/i })` para cover; (c) `fireEvent.error()` na imagem para testar fallback textual.
- **Rationale**:
  - Princípio IV: testes determinísticos, queries acessíveis.
  - `next/image` em Jest renderiza um `<img>` que aceita `onError` simulável.
- **Alternativas consideradas**:
  - Snapshot tests: rejeitado — implementação interna; viola Princípio IV.
  - Pular cobertura de fallback: rejeitado — FR-019 exige comportamento testável.

## 9. Performance e CLS

- **Decisão**:
  - Cover do hero: `priority`, `sizes="(min-width: 1024px) 50vw, 100vw"`, `width`/`height` declarados conforme dimensões nativas (a inferir no quickstart) → reserva espaço, CLS≈0.
  - Logo header: `width={144} height={36}` (proporção do PNG mantida).
  - Logo footer: `width={208} height={52}`.
  - `placeholder="blur"` ou `placeholder="empty"` com cor de fundo do gradiente: avaliar; se `blurDataURL` automático causar overhead, manter `empty`.
- **Rationale**: Atinge SC-002 (LCP) e SC-003 (CLS).
- **Alternativas consideradas**: lazy loading na cover do hero — rejeitado, perde LCP.

## 10. Acessibilidade do duplo-papel "logo + link" no Header

- **Decisão**: O `<Link>` no header recebe `aria-label="Interasis AI - Página inicial"`. A imagem dentro recebe `alt=""` (decorativa, pois o link já tem rótulo). Isso evita anúncio duplicado (FR-009 + acceptance US2.3).
- **Rationale**: Padrão WAI-ARIA para "image inside link" — apenas um nome acessível.
- **Alternativas consideradas**: `alt="Interasis AI"` + sem `aria-label`: aceitável também; preferimos `aria-label` no link por ser mais robusto a mudanças no asset.

## 11. Tema claro/escuro

- **Decisão**: Usar o mesmo logotipo em ambos os temas nesta iteração. O logo é colorido (azul/roxo) com símbolo legível em fundos claros; em fundo escuro do header (`bg-deep`), o contraste é satisfatório porque o nome é claro. Caso futuro stress-test indique baixo contraste em alguma variante, registrar como follow-up (não bloquear esta feature).
- **Rationale**: Não há variantes monocromáticas/SVG fornecidas (premissa do spec).
- **Alternativas consideradas**:
  - Inverter cores via filter CSS: rejeitado — distorce a identidade.
  - Bloquear feature até receber variante alt: rejeitado — degrade aceitável; spec assume isso.

## Resumo

Todas as decisões respeitam a constituição v1.0.0, a especificação 009 e a arquitetura existente (Next.js App Router + Tailwind + Framer Motion + RTL). Nenhum `[NEEDS CLARIFICATION]` permanece. Pronto para Fase 1 (design e contratos).
