---
description: "Task list para implementar a casca global de UI com Header, Footer e wrapper de animação"
---

# Tasks: Casca Global de UI com Navegação, Rodapé e Animação

**Input**: Design documents from `/specs/003-add-ui-shell-motion/`  
**Prerequisites**: plan.md, spec.md

**Tests**: Testes são obrigatórios nesta feature por exigência da constituição do projeto e pelos critérios da especificação.

**Organization**: Tasks agrupadas por user story para permitir implementação e validação incremental.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência direta)
- **[Story]**: Mapeia para user story (`US1`, `US2`, `US3`)
- Descrições incluem caminhos exatos de arquivos

## Path Conventions

- Aplicação web única na raiz
- Código principal em `src/app/`, `src/components/` e `src/theme/`
- Testes com Jest + React Testing Library no próprio diretório do componente/slice

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar estrutura mínima de pastas e contratos de componente para implementação segura.

- [x] T001 Criar estrutura base de componentes em `src/components/layout/` e `src/components/ui/animations/`
- [x] T002 [P] Definir contratos de navegação/CTA em arquivo tipado de apoio em `src/components/layout/navigation.config.ts`
- [x] T003 [P] Criar arquivo de teste do header em `src/components/layout/Header.test.tsx`
- [x] T004 [P] Criar arquivo de teste do footer em `src/components/layout/Footer.test.tsx`
- [x] T005 [P] Criar arquivo de teste do wrapper de animação em `src/components/ui/animations/FadeIn.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estabelecer fundações compartilhadas que bloqueiam as user stories.

**⚠️ CRITICAL**: Nenhuma user story começa antes da conclusão desta fase.

- [x] T006 Validar disponibilidade dos tokens semânticos necessários em `src/theme/design-tokens.ts` para header, footer e CTA
- [x] T007 [P] Ajustar `tailwind.config.ts` para garantir utilitários semânticos usados pela casca global
- [x] T008 [P] Ajustar `src/app/globals.css` com base visual global mínima da casca (superfícies, texto e contraste)
- [x] T009 Definir critérios de acessibilidade e semântica compartilhados no escopo da feature em `specs/003-add-ui-shell-motion/plan.md` (seção de checklist operacional)

**Checkpoint**: Tokens, semântica base e critérios de validação preparados.

---

## Phase 3: User Story 1 - Navegar em qualquer dispositivo com clareza (Priority: P1) 🎯 MVP

**Goal**: Entregar header responsivo com navegação desktop e menu mobile funcional.

**Independent Test**: Verificar links e CTA no desktop; abrir/fechar menu mobile sem inconsistência de estado.

### Tests for User Story 1 ⚠️

> **NOTE: Escrever os testes primeiro e confirmar falha antes da implementação final.**

- [x] T010 [P] [US1] Implementar testes de renderização e semântica do header em `src/components/layout/Header.test.tsx`
- [x] T011 [P] [US1] Implementar testes de interação abre/fecha do menu mobile em `src/components/layout/Header.test.tsx`

### Implementation for User Story 1

- [x] T012 [US1] Implementar componente `Header` em `src/components/layout/Header.tsx`
- [x] T013 [US1] Implementar menu mobile com estado local e acionador acessível em `src/components/layout/Header.tsx`
- [x] T014 [US1] Aplicar tokens semânticos da marca no header e CTA em `src/components/layout/Header.tsx`
- [x] T015 [US1] Integrar `Header` no layout global em `src/app/layout.tsx`

**Checkpoint**: Header responsivo funcional em desktop e mobile.

---

## Phase 4: User Story 2 - Ter estrutura institucional consistente em todas as páginas (Priority: P2)

**Goal**: Entregar footer institucional e consolidar casca global envolvendo conteúdo.

**Independent Test**: Navegar qualquer página e confirmar conteúdo entre header/footer com informações institucionais presentes.

### Tests for User Story 2 ⚠️

- [x] T016 [P] [US2] Implementar testes de conteúdo institucional do footer em `src/components/layout/Footer.test.tsx`
- [x] T017 [P] [US2] Implementar teste de integração da casca global no layout em `src/app/page.test.tsx`

### Implementation for User Story 2

- [x] T018 [US2] Implementar componente `Footer` em `src/components/layout/Footer.tsx`
- [x] T019 [US2] Aplicar paleta semântica e contraste do footer em `src/components/layout/Footer.tsx`
- [x] T020 [US2] Integrar `Footer` no layout global em `src/app/layout.tsx`
- [x] T021 [US2] Garantir estrutura semântica (`header`, `nav`, `main`, `footer`) em `src/app/layout.tsx` e componentes de layout

**Checkpoint**: Casca global consistente e semântica em todas as páginas.

---

## Phase 5: User Story 3 - Reutilizar animação de entrada de conteúdo (Priority: P3)

**Goal**: Entregar wrapper `FadeIn` reutilizável com comportamento consistente em blocos diversos.

**Independent Test**: Aplicar wrapper em blocos distintos e confirmar renderização estável sem erro.

### Tests for User Story 3 ⚠️

- [x] T022 [P] [US3] Implementar testes de renderização e composição children em `src/components/ui/animations/FadeIn.test.tsx`
- [x] T023 [P] [US3] Implementar teste de uso do wrapper em página de exemplo em `src/app/page.test.tsx`

### Implementation for User Story 3

- [x] T024 [US3] Implementar componente `FadeIn` em `src/components/ui/animations/FadeIn.tsx`
- [x] T025 [US3] Garantir suporte a preferência de redução de movimento no `FadeIn` em `src/components/ui/animations/FadeIn.tsx`
- [x] T026 [US3] Aplicar `FadeIn` em ao menos 3 blocos de conteúdo em `src/app/page.tsx`

**Checkpoint**: Wrapper de animação reutilizável e estável no fluxo da página.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechamento da feature com validação completa e documentação de suporte.

- [x] T027 [P] Revisar consistência de tokens semânticos entre `Header`, `Footer` e `FadeIn` nos arquivos de `src/components/`
- [x] T028 [P] Executar suíte de testes com `npm run test`
- [x] T029 [P] Executar validação de build com `npm run build`
- [x] T030 Atualizar notas de validação final em `specs/003-add-ui-shell-motion/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: inicia imediatamente
- **Foundational (Phase 2)**: depende do Setup e bloqueia user stories
- **US1 (Phase 3)**: depende da fase Foundational
- **US2 (Phase 4)**: depende da fase Foundational e integra com US1 no layout
- **US3 (Phase 5)**: depende da fase Foundational e pode ocorrer após estabilizar estrutura global
- **Polish (Phase 6)**: depende das user stories concluídas

### User Story Dependencies

- **US1 (P1)**: sem dependência de outras histórias
- **US2 (P2)**: depende de US1 para consolidação da casca no layout
- **US3 (P3)**: depende de US1 e US2 para validar animação na estrutura global final

### Within Each User Story

- Testes primeiro
- Implementação base em seguida
- Integração no layout por último
- Checkpoint de validação ao final de cada história

### Parallel Opportunities

- `T002`, `T003`, `T004`, `T005` em paralelo
- `T007` e `T008` em paralelo após `T006`
- `T010` e `T011` em paralelo
- `T016` e `T017` em paralelo
- `T022` e `T023` em paralelo
- `T028` e `T029` podem ser executadas por pessoas diferentes

---

## Implementation Strategy

### MVP First (US1)

1. Setup
2. Foundational
3. US1
4. Validar testes do header e interação mobile

### Incremental Delivery

1. Entregar navegação global (US1)
2. Consolidar casca institucional com footer (US2)
3. Adicionar camada de animação reutilizável (US3)
4. Fechar com validação transversal (Polish)

### Parallel Team Strategy

1. Pessoa A: Header + testes de interação
2. Pessoa B: Footer + integração de layout
3. Pessoa C: FadeIn + testes de animação
4. Consolidação final com build e checklist

---

## Notes

- Manter estado local apenas para comportamento de menu mobile.
- Evitar lógica de negócio em componentes visuais.
- Priorizar consultas acessíveis nos testes (`getByRole`, `getByLabelText`, etc.).
- Preservar aderência aos tokens semânticos oficiais já definidos no projeto.
