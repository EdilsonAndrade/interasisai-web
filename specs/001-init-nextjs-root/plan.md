# Implementation Plan: Inicialização do Ecossistema Frontend na Raiz

**Branch**: `[001-init-nextjs-ecosystem]` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-init-nextjs-root/spec.md`

## Summary

Inicializar o frontend principal da Interasis AI diretamente na raiz do repositório usando a base padrão do ecossistema Next.js com App Router, TypeScript, Tailwind e ESLint, removendo o boilerplate inicial e deixando a estrutura pronta para continuidade. A implementação também precisa incluir a base mínima de testes para atender a constituição do repositório e validar a tela inicial limpa.

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js LTS compatível com o ecossistema Next.js atual  
**Primary Dependencies**: Next.js (App Router), React, Tailwind CSS, ESLint, Jest, React Testing Library  
**Storage**: N/A  
**Testing**: Jest + React Testing Library  
**Target Platform**: Aplicação web para ambiente local de desenvolvimento e navegadores modernos  
**Project Type**: Web application  
**Performance Goals**: inicialização local sem erro bloqueante; rota inicial carregando imediatamente com conteúdo mínimo; estrutura sem ativos desnecessários  
**Constraints**: instalação obrigatoriamente na raiz; sem projeto aninhado; estrutura de código em `src/app`; CSS global mínimo; remoção de assets de exemplo; testes mínimos obrigatórios pela constituição  
**Scale/Scope**: 1 aplicação web inicial, 1 rota principal mínima, 1 arquivo global de estilos reduzido, conjunto inicial de configurações raiz

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Hook/UI separation**: PASS. Esta feature não introduz lógica de negócio em componentes; a home inicial será puramente apresentacional.
- **Type safety**: PASS. A base deve nascer com TypeScript configurado e sem uso de `any`.
- **Tests**: PASS WITH REQUIRED WORK. O plano inclui configuração de Jest + React Testing Library e um teste mínimo de renderização da home para satisfazer a constituição.
- **Accessibility**: PASS. A tela inicial deve usar marcação semântica mínima e texto legível.
- **SEO**: PASS WITH REQUIRED WORK. A página inicial deve incluir `metadata` compatível com o App Router, mesmo sendo uma tela simples.
- **Security**: PASS. Não haverá HTML injetado nem exposição de segredos; nenhuma exceção arquitetural é necessária.
- **Performance**: PASS. A entrega remove conteúdo e ativos supérfluos, reduzindo a superfície inicial.
- **Style**: PASS. O plano mantém Tailwind como base única de estilo e reduz o CSS global ao mínimo.

## Project Structure

### Documentation (this feature)

```text
specs/001-init-nextjs-root/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── bootstrap-verification.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
└── app/
    ├── favicon.ico
    ├── globals.css
    ├── layout.tsx
    ├── page.tsx
    └── page.test.tsx

public/

package.json
package-lock.json
next.config.ts or next.config.js
tsconfig.json
eslint.config.* or .eslintrc.*
postcss.config.*
tailwind.config.ts
jest.config.*
jest.setup.*
next-env.d.ts
```

**Structure Decision**: O projeto será tratado como uma única web application na raiz do repositório. A implementação deve manter o código-fonte em `src/app`, as configurações na raiz e uma base mínima de testes no próprio workspace da aplicação.

## Phase 0: Research Outcomes

- Confirmar o uso do gerador oficial na raiz para evitar subdiretórios aninhados.
- Preservar App Router + `src/app` como convenção principal do projeto.
- Reduzir o boilerplate ao mínimo executável e validável.
- Tornar a verificação estrutural parte explícita do contrato da feature.
- Incluir a base de testes desde a primeira entrega por exigência constitucional.

## Phase 1: Design & Implementation Direction

1. Inicializar a aplicação na raiz com os parâmetros que gerem TypeScript, Tailwind, ESLint, App Router, `src` directory e alias padrão.
2. Confirmar que todos os arquivos raiz esperados foram criados sem duplicar o projeto em subpasta.
3. Substituir a home padrão por uma página mínima contendo apenas a mensagem definida na spec.
4. Reduzir `globals.css` ao núcleo mínimo do sistema utilitário.
5. Remover SVGs e ativos de exemplo do diretório público.
6. Adicionar `metadata` na página ou layout inicial para cumprir a constituição.
7. Configurar Jest + React Testing Library para validar a renderização mínima da rota inicial.
8. Validar manualmente a execução local e a estrutura final do projeto.

## Testing Strategy

- **Smoke test da home**: garantir que a página inicial renderiza exclusivamente a mensagem esperada.
- **Validation test of root setup**: confirmar que a aplicação pode ser iniciada a partir da raiz sem dependência de subpasta.
- **Manual acceptance validation**: inspecionar a árvore de arquivos, assets públicos e CSS global para garantir aderência ao ticket.

## Risks & Mitigations

- **Risco**: o gerador recusar ou alterar arquivos existentes na raiz.
  **Mitigação**: executar a criação conscientemente no diretório atual e revisar imediatamente a estrutura resultante.
- **Risco**: a limpeza do boilerplate remover arquivo necessário por engano.
  **Mitigação**: limitar a remoção aos assets de exemplo e validar o app em execução logo após a limpeza.
- **Risco**: a feature ficar sem cobertura de teste por o bootstrap padrão não incluir esse stack.
  **Mitigação**: tratar a configuração de Jest/RTL como parte explícita da implementação.
- **Risco**: a estrutura final divergir do esperado para o repositório.
  **Mitigação**: usar o contrato de verificação e revisar os arquivos raiz antes do encerramento.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
