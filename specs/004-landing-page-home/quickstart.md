# Quickstart: Landing Page Principal (Home)

## Objetivo

Implementar a home de conversão da Interasis AI (EDI-17) com Hero + proposta de valor, mantendo padrão visual Dark/Tech, animações com `<FadeIn>` e cobertura de testes.

## Pré-requisitos

- Dependências instaladas (`npm install`)
- Branch ativa: `004-landing-page-home`
- Base de design tokens já sincronizada (feature 002)

## Fluxo de Implementação

1. Atualize `src/app/page.tsx` com estrutura semântica (`main` + `section`) e Hero Section com `min-h-[80vh]`.
2. Defina headline e subheadline conforme texto aprovado na spec.
3. Adicione os dois CTAs obrigatórios com hierarquia visual (primário e secundário).
4. Crie/estruture `FeatureCard` para evitar repetição de JSX dos serviços.
5. Renderize os 3 serviços obrigatórios com ícones do `lucide-react` em grid responsivo.
6. Aplique `<FadeIn>` nos blocos principais de conteúdo.
7. Garanta que não há alteração no `src/app/layout.tsx`.
8. Atualize `src/app/page.test.tsx` para refletir os novos requisitos funcionais.

## Validação Local

1. Rode os testes da página:
   ```bash
   npm test -- --runTestsByPath src/app/page.test.tsx
   ```
2. Rode a suíte completa:
   ```bash
   npm test
   ```
3. Opcional para validação final de build:
   ```bash
   npm run build
   ```

## Definition of Done da Feature

- Home atende FR-001 a FR-013 da spec.
- Contrato em `contracts/landing-page-home-verification.md` validado.
- Testes da página atualizados e passando.
- Suite geral de testes sem regressão.
- Escopo preservado sem tocar `layout.tsx`.
