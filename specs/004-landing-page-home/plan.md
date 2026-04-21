# Implementation Plan: Landing Page Principal (Home) com Foco em Conversão

**Branch**: `[004-landing-page-home]` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-landing-page-home/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Construir a nova página inicial da Interasis AI com foco em conversão, mantendo identidade visual Dark/Tech, hierarquia clara de conteúdo e responsividade completa. A abordagem técnica será evoluir `src/app/page.tsx` com seções semânticas (Hero + grade de proposta de valor), usar o componente existente `<FadeIn>` para entradas suaves, aplicar tokens semânticos já sincronizados no Tailwind e garantir cobertura de testes unitários com Jest + React Testing Library.

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js LTS em aplicação Next.js 16.2.4  
**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 3.4, Framer Motion 12, Lucide React 1.8  
**Storage**: N/A  
**Testing**: Jest 30 + React Testing Library 16  
**Target Platform**: Web (desktop e mobile) em navegadores modernos
**Project Type**: Web application  
**Performance Goals**: First viewport funcional sem bloqueios, animações de entrada suaves (sem jank perceptível), layout estável em 320px a 1920px  
**Constraints**: manter `layout.tsx` intacto; usar somente Tailwind para estilos; não introduzir `any`; preservar semântica HTML e hierarquia de heading; respeitar design tokens existentes  
**Scale/Scope**: 1 rota (`src/app/page.tsx`), 1 componente interno de card reutilizável para 3 serviços, 1 suíte de testes da página

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Hook/UI separation**: PASS. A feature é majoritariamente apresentacional e não requer lógica de negócio, fetch ou estado global novo.
- **Type safety**: PASS. O plano prevê tipagem explícita para estrutura de cards/CTAs sem uso de `any`.
- **Tests**: PASS WITH REQUIRED WORK. Atualizar/expandir `src/app/page.test.tsx` para validar conteúdo principal, CTAs, grid e responsividade estrutural.
- **Accessibility**: PASS WITH REQUIRED WORK. A implementação deve usar elementos semânticos (`main`, `section`, heading order) e preservar nomes acessíveis dos botões.
- **SEO**: PASS WITH REQUIRED WORK. Garantir `metadata` otimizada para a home no App Router (na própria página ou reaproveitando estratégia definida no app).
- **Security**: PASS. Sem entrada de dados nem HTML dinâmico.
- **Performance**: PASS. Uso de animações encapsuladas em `<FadeIn>` sem bibliotecas de manipulação de DOM.
- **Style**: PASS. Tailwind + tokens semânticos já disponíveis no projeto; visual glassmorphism aplicado sem estilos inline.

## Project Structure

### Documentation (this feature)

```text
specs/004-landing-page-home/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── landing-page-home-verification.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── page.test.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/
│       └── animations/
│           └── FadeIn.tsx
└── theme/
  ├── design-tokens.ts
  └── index.ts

specs/
└── 004-landing-page-home/
  ├── spec.md
  ├── plan.md
  ├── research.md
  ├── data-model.md
  ├── quickstart.md
  └── contracts/
```

**Structure Decision**: O projeto segue como uma única aplicação web Next.js. A implementação da feature ficará concentrada em `src/app/page.tsx` e `src/app/page.test.tsx`, reutilizando `src/components/ui/animations/FadeIn.tsx` e tokens do tema em `src/theme/` sem introduzir nova camada arquitetural.

## Phase 0: Research Outcomes

- Adotar `<FadeIn>` em blocos principais (hero e seção de serviços) para manter consistência com o shell visual já existente.
- Estruturar a home com semântica explícita (`main`, `section`, `h1`, `h2`) para cumprir os gates de SEO e acessibilidade.
- Implementar o grid de proposta de valor com componente interno reutilizável (`FeatureCard`) para manter DRY e facilitar evolução futura.
- Aplicar glassmorphism em cards e CTA secundário usando classes semânticas/tokens existentes, evitando valores arbitrários hardcoded.
- Definir testes orientados ao usuário para presença de headline, subtítulo, CTAs e três serviços, com validação de comportamento responsivo via estrutura renderizada.

## Phase 1: Design & Implementation Direction

1. Refatorar `src/app/page.tsx` para uma Hero Section com `min-h-[80vh]`, headline destacada e dois CTAs em hierarquia visual clara.
2. Criar `FeatureCard` local (no mesmo arquivo da página nesta iteração) para representar os três pilares de serviço com ícones do `lucide-react`.
3. Garantir layout responsivo com `grid-cols-1 md:grid-cols-3` e espaçamentos consistentes em mobile/desktop.
4. Encadear revelação visual usando `<FadeIn>` em blocos de conteúdo, respeitando o comportamento acessível já implementado pelo componente.
5. Reforçar semântica e SEO com heading hierarchy correta e metadados da rota conforme padrão do App Router.
6. Atualizar `src/app/page.test.tsx` cobrindo conteúdo obrigatório e estrutura principal da página.
7. Validar com `npm test` e, se necessário, `npm run build` para garantir integridade da home.

## Post-Design Constitution Check

- **Hook/UI separation**: PASS. O design final mantém foco em apresentação e não introduz fetch/estado de domínio na página.
- **Type safety**: PASS. O modelo prevê entidades e variantes explícitas para CTAs/cards, sem `any`.
- **Tests**: PASS WITH REQUIRED WORK. O design já define cobertura de conteúdo e estrutura em `src/app/page.test.tsx`.
- **Accessibility**: PASS WITH REQUIRED WORK. A estrutura final usa semântica planejada e nomes acessíveis nos CTAs.
- **SEO**: PASS WITH REQUIRED WORK. O plano mantém obrigatoriedade de metadata da rota home no App Router.
- **Security**: PASS. Não há entrada de usuário nem renderização de HTML não confiável.
- **Performance**: PASS. Animações seguem wrapper existente `<FadeIn>` e não ampliam custo estrutural.
- **Style**: PASS. Aplicação de tokens e Tailwind-only permanece aderente à constituição.

## Testing Strategy

- **Home content tests**: validar headline, subtítulo, CTAs e os três cards de serviço por consultas acessíveis.
- **Structure tests**: validar presença de seções principais e headings semânticos esperados.
- **Regression tests**: garantir que o conteúdo continua sendo renderizado dentro do layout global (Header/Footer já providos pelo `layout.tsx`).
- **Full suite check**: executar `npm test` para confirmar ausência de regressões no repositório.

## Risks & Mitigations

- **Risco**: exagerar efeitos visuais e comprometer legibilidade/contraste.
  **Mitigação**: manter tokenização semântica e revisar contraste em texto principal e texto muted.
- **Risco**: dependência de classe visual específica dificultar manutenção futura.
  **Mitigação**: centralizar variações visuais em padrões reutilizáveis (card/CTA) e tokens existentes.
- **Risco**: mudança visual quebrar testes anteriores da home.
  **Mitigação**: atualizar testes com foco em comportamento do usuário, não em detalhes de implementação.
- **Risco**: ruído de escopo ao tocar `layout.tsx`.
  **Mitigação**: manter alteração estrita em `page.tsx` e seus testes, sem mudanças no layout global.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
