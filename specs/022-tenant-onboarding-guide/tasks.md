---

description: "Task list for Guia de onboarding para cadastro de tenant"
---

# Tasks: Guia de onboarding para cadastro de tenant

**Input**: Design documents from `specs/022-tenant-onboarding-guide/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: incluídos e obrigatórios — a constituição do projeto (princípio IV) declara testes não negociáveis. Todo hook novo tem teste com `renderHook`; todo componente interativo tem teste RTL com queries acessíveis; padrão AAA; `localStorage` sempre mockado/limpo entre testes.

**Organization**: tarefas agrupadas por user story (spec.md), na ordem de prioridade P1 → P2 → P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1..US3, mapeando para spec.md — ausente em Setup, Foundational e Polish
- Caminhos de arquivo são relativos à raiz do repositório

---

## Phase 1: Setup

**Purpose**: baseline limpa antes de qualquer mudança.

- [ ] T001 Rodar `npm test`, `npm run lint` e `npm run build` na branch atual e registrar quaisquer falhas/avisos pré-existentes, para não confundi-los com esta feature — **pendente**: por regra MANDATORY do CLAUDE.md, o comando fica para o usuário rodar (ver mensagem final de entrega)

**Checkpoint**: baseline confirmada.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestrutura de estado/persistência consumida por US1 e US3 (US2 não depende desta fase — ver Dependencies).

**⚠️ CRITICAL**: nenhuma tarefa de US1/US3 começa antes desta fase estar completa.

### Implementation

- [X] T002 [P] Criar tipos `OnboardingStepId`, `GuideDisabledFlag`-related e `OnboardingGuideProgress` em `src/services/onboardingGuideStorage.types.ts` (data-model.md — enum de 8 passos e formato das duas chaves de localStorage)
- [X] T003 Criar `src/services/onboardingGuideStorage.ts`: leitura/escrita das chaves `onboarding_guide_disabled` e `` `onboarding_guide_progress:${tenantId}` ``, espelhando o padrão de fallback em memória de `src/services/sessionManager.ts` (nunca lança; `try/set/remove` para checar disponibilidade) (research.md item 4; depends on: T002)
- [X] T004 Criar `src/hooks/useOnboardingGuide.ts`: estado `isEnabled`, `activeTenantId`, `completedSteps`, e as funções `openGuide(tenantId)`, `closeGuide()`, `markStepComplete(stepId)`, `disableGuide()`, `reEnableGuide()`, todas persistindo via `onboardingGuideStorage.ts` (data-model.md — Estado exposto pelo Context; depends on: T003)
- [X] T005 Criar `src/context/OnboardingGuideContext.tsx`: `OnboardingGuideProvider` (`"use client"`) que usa `useOnboardingGuide.ts` internamente, e um hook `useOnboardingGuideContext()` para consumo (Princípio II — Context granular) (depends on: T004)
- [X] T006 Montar `<OnboardingGuideProvider>` em `src/app/[locale]/admin/layout.tsx`, envolvendo `children` (junto a `AdminNavigation`), para sobreviver à navegação entre `/admin/tenants` e `/admin/prompt-manager` (research.md item 2; depends on: T005)

### Tests

- [X] T007 [P] Teste de `onboardingGuideStorage.ts` — fallback em memória quando `localStorage` indisponível, leitura de valor corrompido não lança, persistência correta das duas chaves, em `src/services/onboardingGuideStorage.test.ts` (depends on: T003)
- [X] T008 [P] Teste de `useOnboardingGuide` (`renderHook`) — abrir/fechar guia, marcar item, desativar/reativar, progresso isolado por `tenantId`, em `src/hooks/useOnboardingGuide.test.ts` (depends on: T004) — inclui o caso "não abre com `isEnabled=false`" (cobre também o T025)

**Checkpoint**: Foundation pronta — US1 e US3 podem começar.

---

## Phase 3: User Story 1 - Seguir o checklist até o tenant ficar pronto (Priority: P1) 🎯 MVP

**Goal**: painel lateral fixo com os 8 itens na ordem correta, destaque piscando nos pendentes, progresso preservado ao navegar entre telas.

**Independent Test**: criar um novo tenant, verificar que o painel aparece com os 8 itens na ordem correta, marcar alguns itens e confirmar que o destaque piscando some apenas dos marcados; navegar entre `/admin/tenants` e `/admin/prompt-manager` e confirmar que o progresso se mantém.

### Implementation for User Story 1

- [X] T009 [P] [US1] Criar `src/components/admin/onboarding/onboardingSteps.ts`: array com os 8 passos (`id`, ordem, `label`) exatamente como `spec.md` FR-003
- [X] T010 [US1] Criar `src/components/admin/onboarding/OnboardingGuideItem.tsx`: item de checklist como `<button role="checkbox" aria-checked>` real, com destaque `animate-pulse` (Tailwind) enquanto não concluído, navegável por teclado (research.md item 6; depends on: T009)
- [X] T011 [US1] Criar `src/components/admin/onboarding/OnboardingGuidePanel.tsx`: `<aside aria-label="Guia de configuração do tenant">` fixo, lê `activeTenantId`/`completedSteps`/`markStepComplete`/`closeGuide` do `OnboardingGuideContext`, renderiza os 8 `OnboardingGuideItem`, entrada com slide-in via Framer Motion (`easeOut`) (depends on: T005, T010)
- [X] T012 [US1] Renderizar `<OnboardingGuidePanel />` em `src/app/[locale]/admin/layout.tsx` (só é visível quando `activeTenantId !== null`, controlado pelo próprio componente) (depends on: T006, T011)
- [X] T013 [US1] Chamar `openGuide(tenant_id)` do `OnboardingGuideContext` após a criação do tenant ser concluída com sucesso — **implementado em `src/components/admin/tenants/TenantManagement.tsx`** (no callback `onCreate` passado a `TenantForm`), não em `TenantForm.tsx`: é onde o resto do fluxo de pós-criação já vive (`setEditor(null)`, `grid.fetchPage`), e é o único lugar com o `tenant_id` confirmado após o sucesso da chamada (depends on: T005)

### Tests for User Story 1

- [X] T014 [P] [US1] Teste de `OnboardingGuideItem` — pisca (`animate-pulse`) quando pendente, some ao marcar, ativável por clique e por teclado (Enter/Espaço), `aria-checked` reflete o estado, em `src/components/admin/onboarding/OnboardingGuideItem.test.tsx`
- [X] T015 [P] [US1] Teste de `OnboardingGuidePanel` — 8 itens na ordem definida em `onboardingSteps.ts`; marcar um item via Provider mantém o estado marcado em um novo render (simulação de navegação entre telas), em `src/components/admin/onboarding/OnboardingGuidePanel.test.tsx`
- [X] T016 [US1] Teste de integração — **em `src/components/admin/tenants/TenantManagement.test.tsx`** (acompanha o desvio do T013): preenche e submete o formulário de criação completo e verifica que `openGuide` é chamado com o `tenant_id` digitado

**Checkpoint**: US1 completa e testável de forma independente — MVP do guia entregue.

---

## Phase 4: User Story 2 - Ser lembrado do prompt inicial e da base de conhecimento (Priority: P2)

**Goal**: aviso informativo, não bloqueante, ao clicar em criar tenant.

**Independent Test**: clicar em "criar tenant" e verificar que o aviso aparece perguntando sobre prompt inicial e base de conhecimento, e que clicar em prosseguir (mesmo sem confirmar nada) completa a criação normalmente.

### Implementation for User Story 2

- [X] T017 [US2] Criar `src/components/admin/onboarding/OnboardingPrerequisiteNotice.tsx`: banner informativo perguntando se o prompt inicial e a base de conhecimento já existem — sem nenhum controle que bloqueie ou intercepte o submit do formulário (research.md item 5)
- [X] T018 [US2] Renderizar `<OnboardingPrerequisiteNotice />` em `src/components/admin/tenants/TenantForm.tsx`, visível ao iniciar o fluxo de criação (depends on: T017)

### Tests for User Story 2

- [X] T019 [P] [US2] Teste de `OnboardingPrerequisiteNotice` — renderiza o texto do aviso, é dispensável, não expõe nenhum controle capaz de interceptar ações externas, em `src/components/admin/onboarding/OnboardingPrerequisiteNotice.test.tsx`
- [X] T020 [US2] Teste em `src/components/admin/tenants/TenantForm.test.tsx` — o aviso aparece ao iniciar a criação; submeter o formulário sem interagir com o aviso completa a criação normalmente (nenhum bloqueio)

**Checkpoint**: US1 + US2 juntas cobrem o núcleo do ticket — checklist completo e lembrete inicial.

---

## Phase 5: User Story 3 - Desativar o guia para quem já conhece o processo (Priority: P3)

**Goal**: opção de desativar na primeira exibição do painel, com persistência em `localStorage` e forma de reativar manualmente.

**Independent Test**: desativar o guia na primeira exibição, criar um novo tenant em seguida e confirmar que o painel não aparece mais; verificar que a preferência permanece após recarregar a página no mesmo navegador.

### Implementation for User Story 3

- [X] T021 [US3] Adicionar controle "Desativar guia" dentro de `OnboardingGuidePanel.tsx`, chamando `disableGuide()` do Context (depends on: T005, T011)
- [X] T022 [US3] Garantir que `openGuide` não abre o painel quando `isEnabled === false` — **implementado dentro de `useOnboardingGuide.ts`** (guarda no início de `openGuide`), não no ponto de chamada: assim a regra vale para qualquer chamador presente ou futuro, não só `TenantManagement.tsx` (depends on: T004, T013)
- [X] T023 [US3] Adicionar controle de reativação visível (link/botão "Reativar guia de configuração") em `src/components/admin/tenants/TenantManagement.tsx`, exibido apenas quando `isEnabled === false`, chamando `reEnableGuide()` (depends on: T005)

### Tests for User Story 3

- [X] T024 [P] [US3] Teste do controle "Desativar guia" em `OnboardingGuidePanel.test.tsx` — clicar chama `disableGuide`
- [X] T025 [US3] Teste "não abre com `isEnabled=false`" — **consolidado em `useOnboardingGuide.test.ts` (T008)**: a regra é aplicada dentro do hook (T022), então testá-la de novo no nível de `TenantManagement` só exercitaria o mock, não o comportamento real
- [X] T026 [US3] Teste do controle de reativação em `TenantManagement.test.tsx` — só aparece quando desativado; clicar chama `reEnableGuide`

**Checkpoint**: as três user stories funcionam de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: garantias transversais que não pertencem a uma única história.

- [X] T027 [P] Auditoria de acessibilidade do painel completo — revisão estática confirmada: `<aside aria-label="Guia de configuração do tenant">`; cada item é `<button role="checkbox" aria-checked>` nativo (foco e ativação por teclado vêm de graça); botão "Minimizar guia" com `aria-label`; botões de desativar/reativar com texto visível como nome acessível. Verificação end-to-end em navegador real fica no roteiro manual do T030
- [X] T028 [P] Revisão visual do destaque piscando (`animate-pulse`) quanto à sobriedade — `animate-pulse` aplicado apenas ao indicador circular de 20px do item (borda/preenchimento), nunca ao texto, ao card inteiro ou ao painel — já implementado de forma sóbria por design (research.md item 6), sem ajuste adicional necessário
- [ ] T029 Executar `npm test`, `npm run lint` e `npm run build` como portão de qualidade final, comparando com a baseline do T001 — **pendente**: comando entregue ao usuário (regra MANDATORY do CLAUDE.md)
- [ ] T030 Executar o roteiro completo de `quickstart.md` manualmente e registrar o resultado (incluindo o cenário de guia por navegador, não por dispositivo) — **pendente**: requer `npm run dev` e navegador, fica para o usuário validar

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências — roda primeiro.
- **Foundational (Fase 2)**: depende da Fase 1 — BLOQUEIA US1 e US3.
- **User Stories (Fase 3+)**:
  - US1 (P1) depende da Fase 2 (Context/storage).
  - US2 (P2) **não depende** da Fase 2 — o aviso é local a `TenantForm.tsx`, sem estado persistido; pode ser implementada em paralelo com a Fase 2/US1.
  - US3 (P3) depende da Fase 2 (flag `isEnabled`/`disableGuide`/`reEnableGuide`) e do painel de US1 (T011, para adicionar o controle de desativação) e do gatilho de US1 (T013, para condicionar `openGuide`).
- **Polish (Fase 6)**: depende de todas as histórias desejadas estarem completas.

### Parallel Opportunities

- T002 → T003 → T004 → T005 → T006 formam uma cadeia direta (mesma área de estado); não paralelizáveis entre si, mas T007/T008 (testes) rodam em paralelo entre si assim que suas dependências de implementação existirem.
- US2 (T017–T020) pode ser feita em paralelo com a Fase 2/US1 inteira — só toca `TenantForm.tsx` e arquivos novos próprios.
- US3 depende de US1 estar com o painel pronto (T011) — não pode ser paralelizada com US1 na prática, mesmo estando marcada como user story separada.
- `TenantForm.tsx` é editado por T013 (US1), T018 (US2) e T022/T025 (US3) — essas tarefas não devem ser paralelizadas entre si nesse arquivo.

---

## Parallel Example: Foundational

```bash
# Cadeia sequencial (mesma área de estado):
Task: "Criar tipos em src/services/onboardingGuideStorage.types.ts"
Task: "Criar src/services/onboardingGuideStorage.ts"
Task: "Criar src/hooks/useOnboardingGuide.ts"
Task: "Criar src/context/OnboardingGuideContext.tsx"

# Em paralelo, assim que a implementação correspondente existir:
Task: "Teste de onboardingGuideStorage.ts"
Task: "Teste de useOnboardingGuide (renderHook)"
```

## Parallel Example: User Story 1 vs. User Story 2

```bash
# Podem rodar em paralelo (arquivos disjuntos, exceto o ponto de integração final em TenantForm.tsx):
Task: "US1 — OnboardingGuidePanel.tsx + OnboardingGuideItem.tsx"
Task: "US2 — OnboardingPrerequisiteNotice.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Fase 1 (baseline) e Fase 2 (Context/storage — bloqueante).
2. Completar Fase 3 (US1) — painel funcional com checklist de 8 itens.
3. **PARAR e VALIDAR**: rodar os testes de US1 e o roteiro de `quickstart.md` passos 1–3.

### Incremental Delivery

1. Setup + Foundational → base pronta.
2. US1 → testar isoladamente → MVP (checklist funcional é o núcleo de valor do ticket).
3. US2 → testar isoladamente → reforço do lembrete inicial.
4. US3 → testar isoladamente → conveniência para usuários recorrentes.
5. Polish → portões de qualidade finais + roteiro completo de `quickstart.md`.

### Notes

- `[P]` = arquivos diferentes, sem dependência pendente.
- Rodar `npm test`, `npm run lint` e `npm run build` a cada checkpoint de história, não só no final.
- Nenhum `fetch`/lógica de `localStorage` direto em arquivo `.tsx` — tudo passa por `onboardingGuideStorage.ts` e `useOnboardingGuide.ts` (Princípio I da constituição).
- Parar em qualquer checkpoint para validar a história isoladamente antes de seguir para a próxima.
