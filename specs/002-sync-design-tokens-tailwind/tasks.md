---
description: "Task list for synchronizing the design token skill with the Tailwind theme"
---

# Tasks: Sincronizar Design Tokens da Skill com Tailwind

**Input**: Design documents from `/specs/002-sync-design-tokens-tailwind/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/design-token-sync-verification.md

**Tests**: Testes são obrigatórios nesta feature por exigência do plano e da estratégia de validação do slice técnico tocado.

**Organization**: Tasks agrupadas por user story para permitir implementação, validação e entrega incremental.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependência direta)
- **[Story]**: Identifica a user story associada (`US1`, `US2`, `US3`)
- Cada tarefa inclui caminhos exatos de arquivos quando aplicável

## Path Conventions

- Aplicação web única na raiz do repositório
- Skill oficial em `.ai/skills/deisgn-token/`
- Código-fonte da aplicação em `src/app/`
- Tema compartilhado em `src/theme/` e configuração raiz em `tailwind.config.ts`
- Artefatos de verificação da feature em `specs/002-sync-design-tokens-tailwind/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar os pontos oficiais de sincronização do tema e os artefatos mínimos de validação.

- [X] T001 Criar o barrel de tema compartilhado em `src/theme/index.ts`
- [X] T002 [P] Criar o módulo base de tokens semânticos em `src/theme/design-tokens.ts`
- [X] T003 [P] Criar o arquivo inicial de testes do slice de sincronização em `src/theme/design-tokens.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estabelecer a fonte técnica única de verdade antes de qualquer user story.

**⚠️ CRITICAL**: Nenhuma user story deve começar antes desta fase ser concluída.

- [X] T004 Definir em `src/theme/design-tokens.ts` os grupos semânticos canônicos de marca, superfícies, texto, borda, forma e profundidade extraídos de `.ai/skills/deisgn-token/SKILL.md`
- [X] T005 [P] Exportar em `src/theme/index.ts` os tokens oficiais e o mapa de correspondência consumível pelo projeto
- [X] T006 [P] Estender `tailwind.config.ts` com `darkMode: 'class'` e tokens semânticos baseados em `src/theme/design-tokens.ts`
- [X] T007 Declarar em `src/app/globals.css` as CSS variables globais e a camada `@layer base` conectadas aos tokens oficiais
- [X] T008 Consolidar em `src/theme/design-tokens.test.ts` a validação automatizada de cobertura dos grupos semânticos e da nomenclatura estável

**Checkpoint**: A base oficial de tokens e o tema compartilhado estão prontos para consumo pelas user stories.

---

## Phase 3: User Story 1 - Aplicar a linguagem visual oficial sem retrabalho (Priority: P1) 🎯 MVP

**Goal**: Expor no projeto a convenção visual oficial da skill de forma utilizável por Tailwind e pela aplicação.

**Independent Test**: Validar que a aplicação renderiza uma tela usando apenas tokens semânticos oficiais e que o slice de tokens permanece coberto por teste automatizado.

### Tests for User Story 1 ⚠️

> **NOTE: Escreva/ajuste estes testes primeiro e confirme a falha esperada antes da implementação final**

- [X] T009 [P] [US1] Atualizar `src/theme/design-tokens.test.ts` para validar a exposição de tokens de cor, raio e profundidade consumidos pelo tema Tailwind
- [X] T010 [P] [US1] Atualizar `src/app/page.test.tsx` para validar uma tela de referência usando classes semânticas do tema oficial

### Implementation for User Story 1

- [X] T011 [US1] Implementar em `src/theme/design-tokens.ts` o mapa oficial de tokens semânticos e aliases consumidos pelo tema do projeto
- [X] T012 [US1] Conectar `tailwind.config.ts` ao mapa oficial para expor classes como `bg-brand-primary`, `text-text-strong`, `bg-surface-base` e equivalentes
- [X] T013 [US1] Ajustar `src/app/layout.tsx` para usar as superfícies e cores de texto padrão derivadas de `src/app/globals.css`
- [X] T014 [US1] Refatorar `src/app/page.tsx` para consumir apenas tokens semânticos oficiais em hero, CTA e superfícies principais

**Checkpoint**: A aplicação consome a linguagem visual oficial via tokens semânticos, sem convenção paralela.

---

## Phase 4: User Story 2 - Reduzir divergência entre referência visual e interface entregue (Priority: P2)

**Goal**: Aproximar a interface entregue da hierarquia visual e dos papéis de cor definidos pela referência da skill.

**Independent Test**: Comparar a tela de referência do projeto com a skill e verificar hero azul com gradiente, superfícies claras, CTAs destacados e uso secundário do roxo.

### Tests for User Story 2 ⚠️

- [X] T015 [P] [US2] Expandir `src/app/page.test.tsx` para validar hero com contraste institucional, CTA principal e cards claros alinhados à referência visual

### Implementation for User Story 2

- [X] T016 [US2] Compor em `src/app/page.tsx` uma seção hero com gradiente azul institucional, CTA principal e bloco visual dominante guiados por `.ai/skills/deisgn-token/examples/example-page.webp`
- [X] T017 [US2] Ajustar `src/app/page.tsx` para usar o roxo escuro apenas como apoio visual em badges ou áreas secundárias
- [X] T018 [US2] Refinar em `src/app/globals.css` os gradientes, sombras e raios globais necessários para reproduzir a hierarquia visual da skill sem criar estilos paralelos

**Checkpoint**: A tela de referência preserva a linguagem visual corporativa azul e a distribuição correta de papéis visuais.

---

## Phase 5: User Story 3 - Tornar a fonte de verdade auditável para o time (Priority: P3)

**Goal**: Tornar explícita e auditável a relação entre a skill, o tema do projeto e a inconsistência de nomenclatura existente.

**Independent Test**: Revisar o módulo de tokens e os artefatos da feature e confirmar que a origem oficial, o mapa de correspondência e o typo `deisgn-token` estão documentados sem ambiguidade.

### Tests for User Story 3 ⚠️

- [X] T019 [P] [US3] Atualizar `src/theme/design-tokens.test.ts` para validar a presença de metadados de origem, caminho da imagem de referência e registro da inconsistência `design-token` versus `deisgn-token`

### Implementation for User Story 3

- [X] T020 [US3] Registrar em `src/theme/design-tokens.ts` os metadados de governança da fonte oficial, incluindo caminho da skill, imagem de referência e naming mismatch
- [X] T021 [P] [US3] Atualizar `specs/002-sync-design-tokens-tailwind/contracts/design-token-sync-verification.md` com o checklist final de correspondência entre skill e tema ativo
- [X] T022 [P] [US3] Atualizar `specs/002-sync-design-tokens-tailwind/quickstart.md` com o fluxo de manutenção e auditoria da sincronização dos tokens

**Checkpoint**: A relação entre fonte visual, tema oficial e inconsistências do repositório ficou auditável para manutenção futura.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Encerrar a feature com validação transversal e aderência ao contrato.

- [X] T023 [P] Revisar `specs/002-sync-design-tokens-tailwind/data-model.md` e `specs/002-sync-design-tokens-tailwind/research.md` para refletir o ponto final da implementação, se necessário
- [X] T024 [P] Executar `npm test` na raiz do repositório para validar `src/theme/design-tokens.test.ts` e `src/app/page.test.tsx`
- [X] T025 [P] Executar `npm run build` na raiz do repositório para confirmar compatibilidade do tema com a aplicação
- [X] T026 Validar `specs/002-sync-design-tokens-tailwind/contracts/design-token-sync-verification.md` e `specs/002-sync-design-tokens-tailwind/quickstart.md` contra os critérios `SC-001` a `SC-005`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: começa imediatamente
- **Foundational (Phase 2)**: depende da conclusão do Setup e bloqueia todas as user stories
- **User Story 1 (Phase 3)**: depende da conclusão da fase Foundational
- **User Story 2 (Phase 4)**: depende da conclusão da fase Foundational e pode evoluir a tela criada em US1
- **User Story 3 (Phase 5)**: depende da conclusão da fase Foundational e consolida governança sobre o tema já sincronizado
- **Polish (Phase 6)**: depende das user stories desejadas concluídas

### User Story Dependencies

- **US1 (P1)**: pode começar assim que a fase Foundational terminar; entrega o MVP de consumo dos tokens
- **US2 (P2)**: depende da base semântica entregue por US1 para validar aderência visual sem criar convenção paralela
- **US3 (P3)**: depende do mapa oficial de tokens para documentar a fonte de verdade e a inconsistência de nomenclatura

### Within Each User Story

- Testes do slice primeiro ou ajustados primeiro
- Mapa oficial antes do consumo na interface
- Tema e CSS global antes do refinamento visual
- Governança documental depois da estabilização do tema ativo

### Parallel Opportunities

- `T002` e `T003` podem rodar em paralelo na fase Setup
- `T005`, `T006` e `T007` podem avançar em paralelo após `T004`
- `T009` e `T010` podem ser executadas em paralelo na US1
- `T021` e `T022` podem ser executadas em paralelo na US3
- `T024` e `T025` podem ser divididas entre pessoas diferentes na fase final

---

## Parallel Example: User Story 1

```bash
Task: "T009 [P] [US1] Atualizar src/theme/design-tokens.test.ts para validar a exposição de tokens de cor, raio e profundidade consumidos pelo tema Tailwind"
Task: "T010 [P] [US1] Atualizar src/app/page.test.tsx para validar uma tela de referência usando classes semânticas do tema oficial"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup
2. Concluir Foundational
3. Concluir US1
4. Validar `npm test` e a renderização da tela de referência com tokens semânticos

### Incremental Delivery

1. Base oficial de tokens e tema Tailwind
2. Tela de referência consumindo os tokens oficiais
3. Refino visual alinhado à imagem da skill
4. Governança documental e validação contratual

### Parallel Team Strategy

1. Pessoa A: `src/theme/design-tokens.ts` e `src/theme/index.ts`
2. Pessoa B: `tailwind.config.ts` e `src/app/globals.css`
3. Pessoa C: `src/app/page.tsx` e `src/app/page.test.tsx`
4. Consolidação final: contrato, quickstart, testes e build

---

## Notes

- A pasta `.ai/skills/deisgn-token/` permanece sem renomeação nesta feature; a inconsistência deve ser apenas documentada.
- Os tokens precisam ser consumíveis por Tailwind sem espalhar hexadecimais arbitrários em componentes.
- O contrato documental e a referência visual fazem parte da validação final, não são opcionais.