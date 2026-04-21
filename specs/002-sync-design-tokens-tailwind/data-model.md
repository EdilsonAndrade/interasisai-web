# Data Model: Sincronizar Design Tokens da Skill com Tailwind

## Overview

Esta feature não introduz entidades persistidas. O modelo descreve os artefatos de configuração e governança necessários para manter a sincronização entre a skill de design token e o tema visual do projeto.

## Entities

### Skill de Design Token

- **Description**: Artefato documental do repositório que define a direção visual oficial, os tokens base e as regras de composição para o frontend.
- **Implemented By**: `.ai/skills/deisgn-token/SKILL.MD`
- **Attributes**:
  - `path`: caminho da skill no repositório
  - `tokenGroups`: grupos semânticos declarados na skill
  - `compositionRules`: regras visuais para hero, cards, CTAs e contraste
  - `referenceImagePath`: caminho da imagem usada como evidência visual
  - `namingMismatchRecorded`: indica que o typo `deisgn-token` foi registrado
- **Relationships**:
  - Origina `Mapa de Correspondência de Tokens`
  - Valida `Tema Visual do Projeto`

### Tema Visual do Projeto

- **Description**: Conjunto oficial de tokens disponíveis para uso no frontend via Tailwind e suporte global de estilo.
- **Implemented By**: `src/theme/design-tokens.ts`, `src/theme/index.ts`, `tailwind.config.ts`, `src/app/layout.tsx`
- **Attributes**:
  - `brandTokensPresent`: presença de tokens de marca principais e auxiliares
  - `surfaceTokensPresent`: presença de tokens de página, base, hero e superfícies sutis
  - `textTokensPresent`: presença de tokens de texto forte, corpo e inverso
  - `borderTokensPresent`: presença de tokens de borda semântica
  - `shapeTokensPresent`: presença de tokens de raio por papel visual
  - `depthTokensPresent`: presença de tokens de sombra ou profundidade compatíveis com a skill
  - `tailwindExposed`: indica exposição utilizável no tema oficial
  - `rootCssVariablesInjected`: indica propagação dos CSS custom properties em runtime
- **Relationships**:
  - Deriva da `Skill de Design Token`
  - É descrito pelo `Mapa de Correspondência de Tokens`

### Mapa de Correspondência de Tokens

- **Description**: Relação explícita entre os nomes semânticos da skill e os nomes adotados no tema oficial do projeto.
- **Implemented By**: `tokenCorrespondence` em `src/theme/design-tokens.ts`
- **Attributes**:
  - `sourceTokenName`: nome do token na skill
  - `projectTokenName`: nome do token no tema do projeto
  - `semanticRole`: papel visual representado
  - `coverageStatus`: indica se está mapeado, ausente ou deliberadamente fora de escopo
  - `notes`: observações relevantes para manutenção
- **Relationships**:
  - Conecta `Skill de Design Token` ao `Tema Visual do Projeto`

### Referência Visual

- **Description**: Evidência visual associada à skill usada para validar hierarquia de cor, contraste, composição e ritmo entre superfícies claras e escuras.
- **Implemented By**: `.ai/skills/deisgn-token/examples/example-page.webp` e `src/app/page.tsx`
- **Attributes**:
  - `heroUsesBlueGradient`: confirma predominância do azul no hero
  - `lightSurfaceBalance`: confirma presença de superfícies claras como base de leitura
  - `secondaryPurpleUsage`: confirma uso do roxo como apoio e não como cor dominante
  - `ctaHierarchyVisible`: confirma CTAs com destaque coerente
- **Relationships**:
  - Valida `Tema Visual do Projeto`
  - Informa o `Mapa de Correspondência de Tokens`

## Validation Rules

- `brandTokensPresent`, `surfaceTokensPresent`, `textTokensPresent`, `borderTokensPresent`, `shapeTokensPresent` e `depthTokensPresent` MUST ser `true` para a sincronização ser considerada completa.
- `tailwindExposed` MUST ser `true` para que a equipe consiga consumir o tema sem convenção paralela.
- `rootCssVariablesInjected` MUST ser `true` para manter a definição canônica em TypeScript sem duplicação manual de valores.
- `coverageStatus` MUST indicar explicitamente qualquer lacuna ou descarte de escopo; ausência implícita não é aceitável.
- `namingMismatchRecorded` MUST ser `true` para atender a governança da feature.
- `secondaryPurpleUsage` MUST permanecer de apoio visual; se o roxo virar cor dominante, a sincronização falha frente à referência.
