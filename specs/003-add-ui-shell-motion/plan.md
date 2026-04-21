# Implementation Plan: Casca Global de UI com Navegação, Rodapé e Animação

**Branch**: `[003-add-ui-shell-motion]` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-add-ui-shell-motion/spec.md`

## Summary

Entregar a estrutura global da aplicação com header responsivo, footer institucional e wrapper reutilizável de animação de entrada, garantindo consistência visual com os design tokens oficiais, semântica HTML adequada e cobertura de testes para comportamentos interativos.

## Technical Context

**Language/Version**: TypeScript 5.x com React 19 e Next.js 16.2.4  
**Primary Dependencies**: Next.js App Router, Tailwind CSS 3.4, Jest 30, React Testing Library 16  
**Storage**: N/A  
**Testing**: Jest + React Testing Library (`npm run test`)  
**Target Platform**: Web (desktop e mobile em navegadores modernos)  
**Project Type**: Aplicação web frontend  
**Performance Goals**: manter renderização inicial fluida e interações de menu/animação sem travamentos perceptíveis  
**Constraints**: Tailwind como única estratégia de estilo; sem lógica de negócio em componentes visuais; aderência à paleta semântica da skill  
**Scale/Scope**: 1 layout global, 2 componentes estruturais (header/footer), 1 wrapper de animação reutilizável, testes de interação e integração no layout

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Hook/UI separation**: PASS. Escopo concentrado em componentes de apresentação e estado local de menu.
- **Type safety**: PASS. Exigir tipagem explícita de props e dados de navegação.
- **Tests**: PASS WITH REQUIRED WORK. Necessário cobrir interação do menu mobile e renderização estrutural.
- **Accessibility**: PASS WITH REQUIRED WORK. Garantir semântica (`header`, `nav`, `footer`) e acionadores acessíveis.
- **SEO**: PASS. Mudança principal em layout global, sem alteração obrigatória de metadata.
- **Security**: PASS. Não há entrada sensível nem renderização HTML insegura no escopo.
- **Performance**: PASS. Interações leves de UI com animações de baixo custo.
- **Style**: PASS WITH REQUIRED WORK. Uso exclusivo de tokens semânticos e Tailwind.

### Operational Checklist (Accessibility & Semantics)

- Garantir `header`, `nav`, `main` e `footer` na estrutura global.
- Garantir botão de menu mobile com `aria-expanded`, `aria-controls` e rótulo acessível.
- Garantir navegação principal disponível em desktop e mobile com os mesmos destinos.
- Garantir CTA primário sempre visível na navegação.
- Garantir contraste visual conforme paleta semântica oficial.

## Project Structure

### Documentation (this feature)

```text
specs/003-add-ui-shell-motion/
├── plan.md
├── spec.md
└── checklists/
    └── requirements.md
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
    └── design-tokens.test.ts

src/components/**/__tests__/
```

**Structure Decision**: Manter arquitetura única no frontend atual e introduzir componentes globais em `src/components`, integrando no `src/app/layout.tsx` para garantir reuso e evolução incremental.

## Phase 0: Planning Outcomes

1. Definir contratos de UI para `Header`, `Footer` e `FadeIn` com foco em reuso e sem estado global desnecessário.
2. Estabelecer a lista inicial de navegação e CTA como configuração local do header (simples e tipada).
3. Confirmar mapeamento de tokens semânticos necessários para fundo, texto, bordas, CTA e contraste.
4. Definir critérios objetivos de teste para menu mobile, estrutura global e wrapper de animação.

## Phase 1: Design & Implementation Direction

1. Criar `Header` responsivo com navegação desktop e menu mobile controlado por estado local.
2. Criar `Footer` institucional com blocos de links e contato em hierarquia clara.
3. Criar `FadeIn` reutilizável para revelar conteúdo em scroll com comportamento consistente.
4. Integrar `Header` e `Footer` no layout principal envolvendo `{children}`.
5. Aplicar tokens semânticos da marca em elementos estruturais e CTA.
6. Garantir semântica e acessibilidade básica dos elementos de navegação.
7. Implementar testes unitários/integração para:
   - renderização dos elementos globais
   - toggle abre/fecha do menu mobile
   - uso seguro do wrapper sem erro em render
8. Executar validação final com `npm run test` e revisão visual rápida em desktop/mobile.

## Risks & Mitigations

- **Risco**: Menu mobile inconsistente em mudanças rápidas de viewport.  
  **Mitigação**: Normalizar estado ao fechar menu em navegação e validar cenários de toggle em teste.
- **Risco**: Divergência visual em relação à paleta da skill.  
  **Mitigação**: Restringir classes a tokens semânticos oficiais já definidos no tema.
- **Risco**: Componente de animação virar ponto de acoplamento.  
  **Mitigação**: API simples (children + opções mínimas) e comportamento padrão previsível.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
