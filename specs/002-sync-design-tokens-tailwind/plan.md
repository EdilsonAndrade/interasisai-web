# Implementation Plan: Sincronizar Design Tokens da Skill com Tailwind

**Branch**: `[002-sync-design-tokens-tailwind]` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-sync-design-tokens-tailwind/spec.md`

## Summary

Sincronizar o tema visual do projeto com a skill localizada em `.ai/skills/deisgn-token/`, transformando os tokens e regras de composição da referência oficial em uma convenção semântica utilizável no stack atual com Next.js e Tailwind. A direção técnica é centralizar tokens em uma única definição oficial do projeto, expô-los no tema Tailwind com nomes semânticos estáveis, registrar explicitamente a inconsistência de nomenclatura entre `design-token` e `deisgn-token` como fato de governança e prever uma verificação objetiva da aderência visual sem ampliar o escopo para renomeação estrutural.

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js LTS em aplicação Next.js 16.2.4  
**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 3.4, ESLint 9, Jest 30, React Testing Library 16  
**Storage**: N/A  
**Testing**: Jest + React Testing Library, com validação adicional por contrato documental e revisão visual guiada pela referência da skill  
**Target Platform**: Aplicação web em navegadores modernos, com build local via Node.js  
**Project Type**: Web application  
**Performance Goals**: disponibilizar tokens semânticos em tempo de build, sem camada de resolução em runtime além de CSS variables globais; preservar renderização imediata da rota inicial e futura composição de telas com utilitários previsíveis  
**Constraints**: manter Tailwind como única solução de estilo; não introduzir uma segunda fonte de verdade visual; não renomear diretórios fora do escopo do fluxo; registrar a inconsistência `design-token` versus `deisgn-token`; manter compatibilidade com a estrutura atual em `src/app`  
**Scale/Scope**: 1 aplicação Next.js existente, 1 skill oficial como origem visual, 1 tema Tailwind a ser estendido, 1 contrato de verificação da sincronização e 1 conjunto de grupos semânticos cobrindo marca, superfícies, texto, borda, forma e profundidade

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Hook/UI separation**: PASS. A feature é de tema e tokens; não exige lógica de negócio em componentes. Se houver página de verificação visual, ela deve permanecer apresentacional.
- **Type safety**: PASS. O plano exige tipagem explícita da estrutura de tokens e proíbe mapeamentos ad-hoc implícitos.
- **Tests**: PASS WITH REQUIRED WORK. A implementação deve cobrir o artefato de sincronização com testes automatizados do slice tocado, no mínimo validando a exposição consistente dos tokens ou do ponto de integração escolhido.
- **Accessibility**: PASS. Tokens devem preservar contraste e semântica visual; qualquer tela de referência precisa manter marcação acessível.
- **SEO**: PASS. Nenhuma nova rota é obrigatória pelo plano, mas qualquer página adicionada para validação deve respeitar `metadata` do App Router.
- **Security**: PASS. A feature não envolve HTML dinâmico, segredos ou entrada de usuário.
- **Performance**: PASS. O plano centraliza o tema em configuração estática e CSS global, evitando custo de runtime desnecessário.
- **Style**: PASS. Tailwind continua como solução única; a sincronização deve ocorrer no tema oficial e não por classes arbitrárias espalhadas.

## Project Structure

### Documentation (this feature)

```text
specs/002-sync-design-tokens-tailwind/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── design-token-sync-verification.md
└── tasks.md
```

### Source Code (repository root)

```text
.ai/
└── skills/
    └── deisgn-token/
        ├── SKILL.MD
        └── examples/
            └── example-page.webp

src/
└── app/
    ├── globals.css
    ├── layout.tsx
    ├── page.tsx
    └── page.test.tsx

tailwind.config.ts
package.json
jest.config.mjs
jest.setup.ts
```

**Structure Decision**: O repositório continua como uma única web application Next.js na raiz. A sincronização deve se apoiar na skill existente em `.ai/skills/deisgn-token/`, refletir seus tokens no tema Tailwind oficial do projeto e documentar a verificação da aderência sem criar um design system paralelo fora da stack atual.

## Phase 0: Research Outcomes

- Tratar a skill em `.ai/skills/deisgn-token/SKILL.MD` e sua imagem de exemplo como fonte de verdade visual para a primeira versão da sincronização.
- Centralizar a sincronização em tokens semânticos do projeto, com aliases estáveis para cor, superfície, texto, borda, raio e profundidade.
- Usar extensão do tema Tailwind apoiada por CSS variables globais como estratégia de manutenção, evitando hexadecimais arbitrários espalhados em componentes.
- Considerar a inconsistência `deisgn-token` como observação obrigatória de governança e manutenção, sem promover renomeação automática nesta feature.
- Formalizar a validação da feature por cobertura dos grupos semânticos essenciais e por uma verificação visual orientada pela referência da skill.

## Phase 1: Design & Implementation Direction

1. Extrair da skill os grupos semânticos essenciais e consolidar um mapa oficial de correspondência para o tema do projeto.
2. Definir a convenção de nomes do tema ativo preservando correspondência clara com os nomes semânticos da skill, sem criar apelidos paralelos ambíguos.
3. Estender o tema Tailwind para expor esses grupos semânticos de forma utilizável por utilitários de cor, superfície, borda, sombra e raio.
4. Introduzir CSS variables globais apenas como suporte à manutenção e futura evolução do tema, mantendo o Tailwind como superfície principal de consumo.
5. Registrar no código e na documentação qual artefato é a fonte oficial da direção visual e como detectar lacunas de sincronização.
6. Validar a aderência da sincronização com teste automatizado do slice tocado e checklist visual/contratual baseado na imagem de referência da skill.
7. Manter fora do escopo qualquer renomeação estrutural da pasta `.ai/skills/deisgn-token/`, deixando a inconsistência apenas documentada.

## Testing Strategy

- **Theme synchronization test**: validar que os grupos semânticos essenciais definidos pela feature estão expostos de forma estável no ponto oficial de configuração escolhido.
- **Build validation**: executar `npm run build` para garantir que a extensão do tema não quebra a compilação do app.
- **Visual contract review**: verificar a correspondência entre a referência em `example-page.webp`, o mapa de tokens e o contrato documental da feature.

## Risks & Mitigations

- **Risco**: duplicar a fonte de verdade entre skill, CSS global e Tailwind.
  **Mitigação**: escolher uma definição central com aliases semânticos únicos e documentar o fluxo de manutenção.
- **Risco**: usar nomes excessivamente literais da referência visual e perder clareza semântica no projeto.
  **Mitigação**: priorizar nomes por papel visual e manter um mapa explícito de correspondência com a skill.
- **Risco**: o typo `deisgn-token` induzir decisões de implementação inconsistentes.
  **Mitigação**: registrar o desvio como fato atual do repositório e manter a pasta intacta nesta feature.
- **Risco**: a validação visual ficar subjetiva demais.
  **Mitigação**: vincular a revisão a grupos semânticos obrigatórios, critérios de contraste e ao contrato de verificação desta feature.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
