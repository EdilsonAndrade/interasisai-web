# Data Model: Landing Page Principal (Home)

## Overview

Esta feature não introduz persistência de dados. O modelo descreve entidades de interface e suas regras de composição para garantir rastreabilidade entre especificação, implementação e testes.

## Entities

### HeroSection

- **Description**: Bloco principal de alto impacto da página inicial.
- **Implemented By**: `src/app/page.tsx`
- **Fields**:
  - `headline`: string obrigatória com destaque parcial da expressão principal
  - `subheadline`: string obrigatória com proposta de valor
  - `minViewportHeight`: valor de layout para ocupação dominante da primeira dobra
  - `ctas`: lista com exatamente 2 itens
- **Validation Rules**:
  - Deve conter exatamente 1 heading principal (`h1`)
  - Deve renderizar 2 CTAs com hierarquia visual distinta (primário e secundário)
  - Deve ser renderizada dentro de um contêiner semântico da página

### CTA

- **Description**: Elemento de chamada para ação da Hero Section.
- **Implemented By**: `src/app/page.tsx`
- **Fields**:
  - `label`: texto visível para o usuário
  - `variant`: `primary` | `secondary`
  - `href`: destino de navegação (placeholder permitido)
  - `hoverState`: estado visual de feedback
- **Validation Rules**:
  - Devem existir 2 CTAs obrigatórios: `Explorar Soluções` e `Conhecer Portfólio`
  - `primary` deve possuir maior destaque visual que `secondary`
  - Ambos devem ter nome acessível e feedback visual no hover

### FeatureCard

- **Description**: Card reutilizável para comunicar um pilar de serviço.
- **Implemented By**: `src/app/page.tsx` (componente interno nesta feature)
- **Fields**:
  - `icon`: componente de ícone do `lucide-react`
  - `title`: título curto do serviço
  - `description`: resumo objetivo do serviço
  - `styleVariant`: superfície com glassmorphism
- **Validation Rules**:
  - A seção deve renderizar exatamente 3 cards
  - Cada card deve conter ícone, título e descrição
  - O grid deve colapsar para 1 coluna em mobile e 3 colunas em `md+`

### ValuePropositionSection

- **Description**: Seção secundária que agrupa os três `FeatureCard`.
- **Implemented By**: `src/app/page.tsx`
- **Fields**:
  - `heading`: título da seção (h2)
  - `cards`: coleção de `FeatureCard`
  - `layout`: configuração responsiva do grid
- **Validation Rules**:
  - Deve vir após a Hero Section
  - Deve manter semântica de seção independente
  - Deve preservar legibilidade em telas pequenas

## State Transitions

- **Initial Render**: página carrega com Hero e seção de serviços visíveis na ordem definida.
- **Animated Reveal**: blocos entram com `<FadeIn>` sem alterar conteúdo semântico.
- **Interaction Feedback**: CTAs alteram aparência no hover para sinalizar interatividade.

## Traceability to Requirements

- FR-001 a FR-005: `HeroSection` + `CTA`
- FR-006 a FR-009: `ValuePropositionSection` + `FeatureCard`
- FR-010: `Animated Reveal` com `<FadeIn>`
- FR-011: `layout` responsivo do grid
- FR-012: escopo restrito à página sem alteração de layout global
- FR-013: validado por atualização da suíte `src/app/page.test.tsx`
