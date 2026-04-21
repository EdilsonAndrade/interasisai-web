---
description: "Task list para implementar a Landing Page Principal (Home) com foco em conversão"
---

# Tasks: Landing Page Principal (Home) com Foco em Conversão

**Input**: Design documents from `/specs/004-landing-page-home/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/landing-page-home-verification.md

**Tests**: Testes são obrigatórios nesta feature por exigência da specification (FR-013) e da constitution do projeto.

**Organization**: Tasks agrupadas por user story para permitir implementação e validação incremental.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependência direta)
- **[Story]**: Identifica a user story associada (`US1`, `US2`, `US3`)
- Cada tarefa inclui caminhos exatos de arquivos quando aplicável

## Path Conventions

- Aplicação web única na raiz
- Página principal em `src/app/page.tsx`
- Testes da página em `src/app/page.test.tsx`
- Componente de animação existente em `src/components/ui/animations/FadeIn.tsx`
- Artefatos de especificação em `specs/004-landing-page-home/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar base de trabalho e critérios de validação da feature.

- [x] T001 Revisar e alinhar `specs/004-landing-page-home/contracts/landing-page-home-verification.md` com os cenários da spec
- [x] T002 [P] Criar/organizar estrutura de dados da home (conteúdo de hero e serviços) em `src/app/page.tsx`
- [x] T003 [P] Preparar casos de teste-alvo para a nova home em `src/app/page.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estabelecer fundações técnicas que bloqueiam todas as user stories.

**⚠️ CRITICAL**: Nenhuma user story começa antes da conclusão desta fase.

- [x] T004 Validar disponibilidade dos tokens semânticos usados pela home em `src/theme/design-tokens.ts` e `tailwind.config.ts`
- [x] T005 [P] Garantir que `src/components/ui/animations/FadeIn.tsx` cobre uso da feature (incluindo reduced motion)
- [x] T006 [P] Definir estrutura semântica base da página (`main`, `section`, ordem de headings) em `src/app/page.tsx`
- [x] T007 Definir estratégia de metadata SEO da rota home no App Router em `src/app/page.tsx`

**Checkpoint**: Base semântica, animação e tokens prontos para implementação por user story.

---

## Phase 3: User Story 1 - Visitante Descobre o Valor da Empresa (Priority: P1) 🎯 MVP

**Goal**: Entregar Hero Section de alto impacto com mensagem clara e animação de entrada.

**Independent Test**: Visitante identifica o valor da Interasis AI em até 30 segundos ao visualizar a primeira dobra.

### Tests for User Story 1 ⚠️

> **NOTE: Escrever testes primeiro e confirmar falha antes da implementação final.**

- [x] T008 [P] [US1] Escrever teste de renderização do H1 principal em `src/app/page.test.tsx`
- [x] T009 [P] [US1] Escrever teste do subtítulo de proposta de valor em `src/app/page.test.tsx`
- [x] T010 [P] [US1] Escrever teste de presença de `<FadeIn>` nos blocos da hero em `src/app/page.test.tsx`

### Implementation for User Story 1

- [x] T011 [US1] Implementar Hero Section com `min-h-[80vh]` em `src/app/page.tsx`
- [x] T012 [US1] Aplicar headline com destaque visual para “Inteligência Artificial” em `src/app/page.tsx`
- [x] T013 [US1] Implementar subheadline com texto de benefícios em `src/app/page.tsx`
- [x] T014 [US1] Envolver blocos principais da hero com `FadeIn` em `src/app/page.tsx`

**Checkpoint**: Hero funcional, clara e animada conforme spec.

---

## Phase 4: User Story 2 - Visitante Explora os Serviços Oferecidos (Priority: P2)

**Goal**: Exibir proposta de valor com 3 serviços em cards com visual glassmorphism e grid responsivo.

**Independent Test**: Visitante identifica os 3 pilares de serviço em desktop e mobile sem quebra de layout.

### Tests for User Story 2 ⚠️

- [x] T015 [P] [US2] Escrever teste para renderização dos 3 serviços obrigatórios em `src/app/page.test.tsx`
- [x] T016 [P] [US2] Escrever teste da estrutura responsiva do grid em `src/app/page.test.tsx`
- [x] T017 [P] [US2] Escrever teste para presença de ícone/título/descrição por card em `src/app/page.test.tsx`

### Implementation for User Story 2

- [x] T018 [US2] Criar componente interno `FeatureCard` em `src/app/page.tsx`
- [x] T019 [US2] Implementar seção de proposta de valor abaixo da hero em `src/app/page.tsx`
- [x] T020 [US2] Integrar ícones `lucide-react` nos 3 cards em `src/app/page.tsx`
- [x] T021 [US2] Aplicar estilo glassmorphism nos cards com tokens semânticos em `src/app/page.tsx`
- [x] T022 [US2] Configurar grid `grid-cols-1 md:grid-cols-3` em `src/app/page.tsx`

**Checkpoint**: Seção de serviços completa, responsiva e consistente com identidade visual.

---

## Phase 5: User Story 3 - Visitante Toma Ação (CTA) (Priority: P3)

**Goal**: Entregar CTAs com hierarquia visual clara e feedback de interatividade.

**Independent Test**: Visitante identifica facilmente CTA primário e secundário e percebe estados de hover.

### Tests for User Story 3 ⚠️

- [x] T023 [P] [US3] Escrever teste de presença dos dois CTAs obrigatórios em `src/app/page.test.tsx`
- [x] T024 [P] [US3] Escrever teste de hierarquia visual esperada entre CTA primário e secundário em `src/app/page.test.tsx`
- [x] T025 [P] [US3] Escrever teste de estrutura acessível dos CTAs (nome/role) em `src/app/page.test.tsx`

### Implementation for User Story 3

- [x] T026 [US3] Implementar CTA primário “Explorar Soluções” com estilos de destaque em `src/app/page.tsx`
- [x] T027 [US3] Implementar CTA secundário “Conhecer Portfólio” com estilo outline/glassmorphism em `src/app/page.tsx`
- [x] T028 [US3] Aplicar estados de hover para ambos os CTAs em `src/app/page.tsx`
- [x] T029 [US3] Definir destino placeholder seguro dos CTAs (`#`) em `src/app/page.tsx`

**Checkpoint**: CTAs concluídos com hierarquia, acessibilidade e feedback visual.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechamento da feature e validação transversal.

- [x] T030 [P] Revisar semântica final e ordem de headings em `src/app/page.tsx`
- [x] T031 [P] Revisar aderência visual aos tokens e evitar classes arbitrárias em `src/app/page.tsx`
- [x] T032 [P] Rodar testes focados da página: `npm test -- --runTestsByPath src/app/page.test.tsx`
- [x] T033 [P] Rodar suíte completa: `npm test`
- [x] T034 [P] Validar build: `npm run build`
- [x] T035 Atualizar checklist final da feature em `specs/004-landing-page-home/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: inicia imediatamente
- **Foundational (Phase 2)**: depende do Setup e bloqueia user stories
- **US1 (Phase 3)**: depende da conclusão da fase Foundational
- **US2 (Phase 4)**: depende da conclusão da fase Foundational; pode reutilizar estrutura da US1
- **US3 (Phase 5)**: depende da conclusão da fase Foundational; integra na hero implementada em US1
- **Polish (Phase 6)**: depende das user stories concluídas

### User Story Dependencies

- **US1 (P1)**: sem dependência de outras histórias
- **US2 (P2)**: usa a mesma página, mas deve permanecer testável independentemente da US3
- **US3 (P3)**: integra na hero e deve manter independência de validação funcional

### Within Each User Story

- Testes primeiro
- Implementação base depois
- Ajustes visuais/integração por último
- Checkpoint ao final de cada história

### Parallel Opportunities

- `T002` e `T003` em paralelo
- `T005` e `T006` em paralelo
- `T008`, `T009`, `T010` em paralelo
- `T015`, `T016`, `T017` em paralelo
- `T023`, `T024`, `T025` em paralelo
- `T032`, `T033`, `T034` podem ser executadas por pessoas diferentes

---

## Parallel Example: User Story 1

```bash
Task: "T008 [P] [US1] Escrever teste de renderização do H1 principal em src/app/page.test.tsx"
Task: "T009 [P] [US1] Escrever teste do subtítulo de proposta de valor em src/app/page.test.tsx"
Task: "T010 [P] [US1] Escrever teste de presença de FadeIn nos blocos da hero em src/app/page.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup
2. Concluir Foundational
3. Concluir US1
4. Validar renderização da hero e testes da página

### Incremental Delivery

1. Hero com proposta de valor (US1)
2. Grade de serviços (US2)
3. CTAs com conversão e hover (US3)
4. Validação final (Polish)

### Parallel Team Strategy

1. Pessoa A: testes da home (`src/app/page.test.tsx`)
2. Pessoa B: Hero + CTAs (`src/app/page.tsx`)
3. Pessoa C: seção de serviços e refinos visuais (`src/app/page.tsx`)
4. Consolidação final com build, checklist e contrato

---

## Notes

- Não alterar `src/app/layout.tsx` nesta feature.
- Priorizar consultas acessíveis nos testes (`getByRole`, `getByText`, `getByLabelText` quando aplicável).
- Manter DRY via `FeatureCard` reutilizável.
- Preservar classes semânticas alinhadas aos design tokens já sincronizados no projeto.
