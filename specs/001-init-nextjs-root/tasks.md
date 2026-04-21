---
description: "Task list for bootstrapping the Interasis AI frontend in the repository root"
---

# Tasks: Inicialização do Ecossistema Frontend na Raiz

**Input**: Design documents from `/specs/001-init-nextjs-root/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/bootstrap-verification.md

**Tests**: Testes são obrigatórios nesta feature por exigência da constituição do repositório.

**Organization**: Tasks agrupadas por user story para permitir implementação e validação incremental.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependência direta)
- **[Story]**: Identifica a user story associada (`US1`, `US2`, `US3`)
- Cada tarefa inclui caminhos exatos de arquivos quando aplicável

## Path Conventions

- Aplicação web única na raiz do repositório
- Código-fonte em `src/app/`
- Configurações na raiz (`package.json`, `tsconfig.json`, `tailwind.config.ts`, etc.)
- Testes iniciais junto da aplicação em `src/app/` e arquivos de setup na raiz

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar o workspace frontend na raiz com a base técnica esperada.

- [X] T001 Executar o bootstrap do projeto Next.js na raiz do repositório gerando `package.json`, `next.config.*`, `tsconfig.json`, `postcss.config.*`, `tailwind.config.ts`, `next-env.d.ts`, `eslint.config.*` e `src/app/*`
- [X] T002 Confirmar que o manifesto e os arquivos principais de configuração estão na raiz do repositório e que não foi criado subprojeto aninhado
- [X] T003 [P] Revisar e ajustar o `.gitignore` na raiz para cobrir artefatos padrão do ecossistema Next.js e de testes, se necessário

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Garantir a base mínima obrigatória para que qualquer user story possa ser aceita.

**⚠️ CRITICAL**: Nenhuma user story deve ser considerada concluída sem esta fase.

- [X] T004 Configurar a base de testes com `jest.config.*` e `jest.setup.*` na raiz do repositório
- [X] T005 [P] Configurar suporte de teste de interface para App Router e Testing Library a partir de `package.json` e `jest.setup.*`
- [X] T006 [P] Definir `metadata` inicial em `src/app/layout.tsx` ou `src/app/page.tsx` para cumprir o gate de SEO da constituição
- [X] T007 Criar o teste de fumaça inicial em `src/app/page.test.tsx` validando a mensagem mínima da home
- [X] T008 Executar a suíte mínima de testes e ajustar a configuração até o teste inicial rodar com sucesso

**Checkpoint**: Base pronta para implementar e validar as user stories.

---

## Phase 3: User Story 1 - Inicializar o projeto na raiz (Priority: P1) 🎯 MVP

**Goal**: Entregar a aplicação web operando diretamente na raiz do repositório, sem estrutura duplicada.

**Independent Test**: Rodar o comando padrão de desenvolvimento na raiz e confirmar que a aplicação sobe sem subpasta adicional nem erro bloqueante.

### Tests for User Story 1 ⚠️

> **NOTE: Escreva/ajuste estes testes primeiro e confirme o comportamento esperado antes de fechar a implementação**

- [X] T009 [P] [US1] Ajustar `src/app/page.test.tsx` para cobrir a renderização da home mínima a partir da estrutura real gerada

### Implementation for User Story 1

- [X] T010 [US1] Validar que `src/app/` foi gerado como diretório principal de código-fonte e corrigir a estrutura caso o bootstrap tenha divergido
- [X] T011 [US1] Garantir que `package.json` permaneça na raiz e remover qualquer diretório de projeto duplicado criado incorretamente
- [X] T012 [US1] Configurar scripts de execução e teste em `package.json` para rodar o ambiente local e a suíte mínima de validação
- [X] T013 [US1] Iniciar o ambiente local a partir da raiz e verificar que a aplicação responde corretamente na porta padrão

**Checkpoint**: A aplicação existe como projeto único na raiz e inicia localmente.

---

## Phase 4: User Story 2 - Remover o boilerplate inicial (Priority: P2)

**Goal**: Deixar a experiência inicial limpa, mínima e sem artefatos de exemplo.

**Independent Test**: Acessar a rota inicial local e confirmar que só a mensagem definida aparece; revisar estilos e diretório público.

### Tests for User Story 2 ⚠️

- [X] T014 [P] [US2] Atualizar `src/app/page.test.tsx` para validar explicitamente que a página inicial exibe apenas o texto "Interasis AI - Ambiente Inicializado"

### Implementation for User Story 2

- [X] T015 [US2] Substituir o conteúdo padrão de `src/app/page.tsx` pela tela mínima com a mensagem definida na spec
- [X] T016 [US2] Reduzir `src/app/globals.css` para manter apenas as diretivas fundamentais do Tailwind
- [X] T017 [US2] Remover ativos públicos de exemplo em `public/` como `next.svg`, `vercel.svg` e equivalentes não utilizados
- [X] T018 [US2] Revisar `src/app/layout.tsx` para garantir que a experiência inicial permaneça mínima e compatível com a home limpa

**Checkpoint**: A home está limpa, o CSS global está mínimo e os assets de exemplo foram removidos.

---

## Phase 5: User Story 3 - Entregar base pronta para continuidade (Priority: P3)

**Goal**: Garantir que a estrutura final e a configuração do projeto estejam prontas para as próximas features.

**Independent Test**: Revisar a árvore final, os arquivos de configuração raiz e executar o fluxo descrito em `quickstart.md` sem ajustes manuais extras.

### Tests for User Story 3 ⚠️

- [X] T019 [P] [US3] Executar a suíte de testes e confirmar que a configuração final continua validando `src/app/page.test.tsx` após a limpeza estrutural

### Implementation for User Story 3

- [X] T020 [US3] Revisar `tsconfig.json` para confirmar alias, tipagem e estrutura de código compatíveis com o plano
- [X] T021 [P] [US3] Revisar `tailwind.config.ts` e `postcss.config.*` para confirmar a base de estilização utilitária esperada
- [X] T022 [P] [US3] Revisar `eslint.config.*` para confirmar que a configuração inicial de lint está pronta para continuidade
- [X] T023 [US3] Validar `next.config.*` para garantir que a base do projeto esteja pronta para evoluções futuras sem quebrar a inicialização atual
- [X] T024 [US3] Executar a checklist de `specs/001-init-nextjs-root/quickstart.md` e o contrato em `specs/001-init-nextjs-root/contracts/bootstrap-verification.md`

**Checkpoint**: O projeto está configurado, validado e pronto para receber novas tasks.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechar a entrega com validação final transversal.

- [X] T025 [P] Documentar qualquer divergência relevante encontrada durante a implementação diretamente em `specs/001-init-nextjs-root/plan.md` ou artefatos da feature, se necessário
- [X] T026 Executar `npm test` e `npm run dev` na raiz como validação final da entrega
- [X] T027 Verificar manualmente a rota inicial em `localhost:3000` para confirmar o texto único e a ausência de boilerplate visual
- [X] T028 Confirmar que a árvore final do repositório atende `SC-001` a `SC-005` antes de encerrar a feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: começa imediatamente
- **Foundational (Phase 2)**: depende da conclusão do Setup e bloqueia todas as user stories
- **User Story 1 (Phase 3)**: depende da conclusão da fase Foundational
- **User Story 2 (Phase 4)**: depende da conclusão da fase Foundational; pode começar após US1 estruturalmente estável
- **User Story 3 (Phase 5)**: depende da base criada nas fases anteriores
- **Polish (Phase 6)**: depende de todas as user stories concluídas

### User Story Dependencies

- **US1**: sem dependência funcional em outras stories; entrega o MVP estrutural
- **US2**: depende da existência do projeto inicial gerado por US1
- **US3**: depende da estrutura e limpeza concluídas em US1 e US2

### Within Each User Story

- Testes primeiro ou ajustados primeiro quando a story alterar comportamento validado
- Estrutura antes de limpeza visual
- Configuração antes de validação final
- Story concluída antes do checkpoint seguinte

### Parallel Opportunities

- `T003`, `T005` e `T006` podem rodar em paralelo após o bootstrap
- `T021` e `T022` podem rodar em paralelo na US3
- Tarefas de revisão de configuração podem ser paralelizadas quando não alterarem o mesmo arquivo

---

## Parallel Example: Foundational

```bash
Task: "T005 [P] Configurar suporte de teste de interface a partir de package.json e jest.setup.*"
Task: "T006 [P] Definir metadata inicial em src/app/layout.tsx ou src/app/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup
2. Concluir Foundational
3. Concluir US1
4. Validar que o projeto sobe da raiz sem estrutura aninhada

### Incremental Delivery

1. Bootstrap e base de testes
2. Estrutura única na raiz
3. Limpeza completa da home e do boilerplate
4. Revisão final da configuração e contrato de verificação

### Parallel Team Strategy

1. Pessoa A: bootstrap e scripts raiz
2. Pessoa B: setup de Jest/RTL e smoke test
3. Pessoa C: limpeza da home, CSS global e assets públicos
4. Consolidação final: revisão de configs e validação do contrato

---

## Notes

- Cada tarefa foi mapeada para uma user story ou fase compartilhada.
- A constituição torna testes obrigatórios nesta feature; por isso eles não são opcionais aqui.
- Evitar mudanças fora do escopo de bootstrap inicial.
- Validar sempre contra `quickstart.md` e `contracts/bootstrap-verification.md` antes de encerrar.
