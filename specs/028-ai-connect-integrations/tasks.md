# Tasks: InterasisAI Connect — Posicionamento de Integrações e Expansibilidade

**Input**: Design documents from `specs/028-ai-connect-integrations/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contracts.md, quickstart.md

**Tests**: Incluídos — a constituição do projeto (Princípio IV) exige cobertura Jest + React Testing Library como parte do "Done".

**Organization**: Tarefas agrupadas por user story (US1 = card, US2 = seção de integrações, US3 = diagrama animado), permitindo implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User story de origem (US1, US2, US3)

## Path Conventions

- Aplicação Next.js única: `src/` na raiz do repositório (sem split frontend/backend).
- Conteúdo localizado: `src/i18n/locales/{pt-BR,en,es}/*.json`.
- Componentes da página Saiba Mais: `src/components/connect/`.
- Card do portfólio: `src/components/ui/PortfolioCard.tsx` + `PortfolioSection.tsx`.

---

## Phase 1: Setup

**Purpose**: Linha de base verde antes de qualquer mudança

- [X] T001 Rodar `npm test` e `npx tsc --noEmit` na branch `028-ai-connect-integrations` e registrar que a linha de base está verde (nenhum arquivo alterado ainda)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos compartilhados que US2 e US3 consomem

**⚠️ CRITICAL**: US2 e US3 não podem começar antes desta fase

- [X] T002 Adicionar tipos `IntegrationCategoryId`, `IntegrationCategory` e `ConnectIntegrationsContent`, e estender `ConnectPageContent` com o campo obrigatório `integrations`, em `src/components/connect/types.ts` (conforme contrato C1 de `contracts/ui-contracts.md` e entidades de `data-model.md`)

**Checkpoint**: Tipos prontos — US2/US3 podem começar; US1 é independente e pode começar em paralelo

---

## Phase 3: User Story 1 — O card comunica que o produto vai além do agendamento (Priority: P1) 🎯 MVP

**Goal**: O card do InterasisAI Connect na landing page passa a comunicar integração (CRM, base de dados, APIs e outros) e expansibilidade por projeto de escopo fechado, mantendo o agendamento como funcionalidade básica.

**Independent Test**: Abrir a landing page em cada idioma e ler apenas o card — o texto de impacto e a descrição comunicam integração/expansibilidade, o agendamento permanece mencionado e a lista de diferenciais exibe 5 itens (o novo sobre integração).

### Implementation for User Story 1

- [X] T003 [US1] Reescrever `description` e `impactText` (novo posicionamento: integrações + projeto de escopo fechado, agendamento mantido como base) e adicionar 5º item em `highlights` sobre integração com CRM/base de dados/APIs, em `src/i18n/locales/pt-BR/home.json` (bloco `portfolio.projects.chatAssistant`; sem marcas de terceiros — FR-013)
- [X] T004 [P] [US1] Aplicar as mesmas mudanças de T003 em `src/i18n/locales/en/home.json` (traduzido para inglês)
- [X] T005 [P] [US1] Aplicar as mesmas mudanças de T003 em `src/i18n/locales/es/home.json` (traduzido para espanhol)
- [X] T006 [P] [US1] Substituir o mapeamento indexado `t("portfolio.projects.chatAssistant.highlights.0")`…`.3` por `t.raw("portfolio.projects.chatAssistant.highlights")` em `src/components/ui/PortfolioSection.tsx` (somente o bloco `chatAssistant`; demais projetos permanecem indexados)
- [X] T007 [US1] Atualizar `src/components/ui/PortfolioCard.test.tsx`: caso com 5 highlights renderizados e caso garantindo que `impactText` renderiza distinto da `description` (AAA, queries acessíveis)

**Checkpoint**: Card do InterasisAI Connect com novo posicionamento funcional e testável nos 3 idiomas, independente das demais stories

---

## Phase 4: User Story 2 — A página Saiba Mais apresenta a seção de integrações e expansibilidade (Priority: P1)

**Goal**: A página `/interasisai-connect` ganha uma seção dedicada com as categorias integráveis (CRM, base de dados, API, MCP, sistemas de RH, outras) e a explicação do modelo de projeto de escopo fechado.

**Independent Test**: Navegar até `/pt-BR/interasisai-connect` (e `/en`, `/es`, e pela URL direta) e ver a seção com título, texto de escopo fechado e os 6 rótulos de categoria, sem depender da animação.

### Implementation for User Story 2

- [X] T008 [US2] Adicionar chave `integrations` (title, description, closedScope, `categories[]` com 6 itens `{ id, label, description }` e `diagram.{nucleusLabel, ariaLabel, caption}`) em `src/i18n/locales/pt-BR/connect.json` (conforme contrato C3; siglas API/MCP mantidas)
- [X] T009 [P] [US2] Adicionar a mesma chave `integrations` traduzida em `src/i18n/locales/en/connect.json`
- [X] T010 [P] [US2] Adicionar a mesma chave `integrations` traduzida em `src/i18n/locales/es/connect.json`
- [X] T011 [US2] Montar `content.integrations` via `t`/`t.raw` em `src/app/[locale]/interasisai-connect/page.tsx` (conforme contrato C5)
- [X] T012 [US2] Adicionar a seção de integrações (h2 + description + closedScope + lista das 6 categorias) em `src/components/connect/ConnectPage.tsx`, entre a seção de arquitetura e a tabela comparativa
- [X] T013 [US2] Atualizar o fixture e adicionar testes da seção em `src/components/connect/ConnectPage.test.tsx` (título da seção, texto de escopo fechado e todos os rótulos de categoria renderizados)

**Checkpoint**: Seção de integrações completa e testável nos 3 idiomas, independente do diagrama animado

---

## Phase 5: User Story 3 — Animação do processo de integração (Priority: P2)

**Goal**: Diagrama animado dentro da seção de integrações: núcleo central (chat + agentes) conectado por setas em loop contínuo aos nós de ambientes, com fallback estático (`prefers-reduced-motion`), alternativa textual para leitores de tela e layout responsivo sem rolagem horizontal.

**Independent Test**: Carregar a página Saiba Mais e ver as setas fluindo do núcleo para os nós; com `prefers-reduced-motion: reduce` ativado, o diagrama fica estático com todos os rótulos legíveis; em mobile, sem rolagem horizontal.

### Implementation for User Story 3

- [X] T014 [US3] Criar `src/components/connect/ConnectIntegrationDiagram.tsx` ("use client"): SVG com `motion.path` animando `pathLength`/`strokeDashoffset` em loop (`repeat: Infinity`, easing linear), `useReducedMotion()` renderizando versão estática, wrapper com `role="img"` + `aria-label`, lista `ul` `sr-only` com núcleo + categorias, glow dos nós via Tailwind `shadow-[...]`, overlay SVG visível apenas em `md:`+ com grade 2 colunas em mobile (conforme research R1–R3, R6 e contrato C2)
- [X] T015 [US3] Renderizar `ConnectIntegrationDiagram` dentro da seção de integrações em `src/components/connect/ConnectPage.tsx`, recebendo `categories`, `nucleusLabel`, `ariaLabel` e `caption` do content
- [X] T016 [US3] Criar `src/components/connect/ConnectIntegrationDiagram.test.tsx`: rótulos de todos os nós, `role="img"` com `aria-label` correto, lista `sr-only` presente, e fallback estático quando `matchMedia("(prefers-reduced-motion: reduce)")` é simulado como `true`
- [X] T017 [US3] Atualizar `src/components/connect/ConnectPage.test.tsx` para cobrir a presença do diagrama na seção de integrações

**Checkpoint**: As três user stories estão funcionais e testáveis de forma independente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final da feature como um todo

- [X] T018 [P] Rodar `npm test` e corrigir qualquer falha/regressão
- [X] T019 [P] Rodar `npm run lint` e corrigir violações de ESLint
- [X] T020 [P] Rodar `npx tsc --noEmit` e garantir zero erros de tipo (zero `any`)
- [X] T021 Executar a validação manual do `quickstart.md`: card e página nos 3 idiomas, `prefers-reduced-motion`, viewport mobile sem rolagem horizontal, sem regressão nas abas de vertical/CTA "Testar Assistente ao Vivo"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — começa imediatamente
- **Foundational (Phase 2)**: Depende do Setup; **BLOQUEIA** US2 e US3 (tipos compartilhados)
- **US1 (Phase 3)**: Independente da fase Foundational — pode começar em paralelo com Phase 2
- **US2 (Phase 4)**: Depende de T002 (tipos)
- **US3 (Phase 5)**: Depende de T002 (tipos) e da seção da US2 (T012) para renderizar dentro dela
- **Polish (Phase 6)**: Depende de todas as stories desejadas completas

### User Story Dependencies

- **US1 (P1)**: Sem dependências de outras stories; arquivos próprios (`home.json` ×3, `PortfolioSection.tsx`, `PortfolioCard.test.tsx`)
- **US2 (P1)**: Precisa de T002; arquivos próprios (`connect.json` ×3, `page.tsx`, `ConnectPage.tsx`, `ConnectPage.test.tsx`)
- **US3 (P2)**: Precisa de T002 + seção da US2 (T012); arquivos próprios (`ConnectIntegrationDiagram.tsx` + teste) + integração em `ConnectPage.tsx` (T015 toca arquivo da US2 — agendar após T012)

### Within Each User Story

- Conteúdo i18n antes do consumo no componente
- Componente antes dos testes que o cobrem
- Story completa antes de avançar para a próxima prioridade

### Parallel Opportunities

- T003/T004/T005 (3 idiomas) e T006 (PortfolioSection) rodam em paralelo
- T008/T009/T010 (3 idiomas da seção) rodam em paralelo
- US1 inteira pode rodar em paralelo com a Phase 2 + US2/US3 (arquivos disjuntos)
- T018/T019/T020 (test/lint/typecheck) rodam em paralelo

---

## Parallel Example: User Story 1

```bash
# Conteúdo dos 3 idiomas + componente, juntos:
Task: "T003 — Reescrever description/impactText/highlights em src/i18n/locales/pt-BR/home.json"
Task: "T004 — Mesmas mudanças em src/i18n/locales/en/home.json"
Task: "T005 — Mesmas mudanças em src/i18n/locales/es/home.json"
Task: "T006 — t.raw de highlights em src/components/ui/PortfolioSection.tsx"
```

## Parallel Example: User Story 2

```bash
# Conteúdo dos 3 idiomas juntos:
Task: "T008 — Chave integrations em src/i18n/locales/pt-BR/connect.json"
Task: "T009 — Chave integrations em src/i18n/locales/en/connect.json"
Task: "T010 — Chave integrations em src/i18n/locales/es/connect.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. Complete Phase 3: US1 (novo posicionamento do card)
3. **PARE E VALIDE**: card testável isoladamente nos 3 idiomas
4. Deploy/demo se quiser — o card já corrige a percepção de "só agendamento"

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → card com novo posicionamento → validar → deploy (MVP)
3. US2 → seção de integrações na página → validar → deploy
4. US3 → diagrama animado → validar → deploy
5. Cada story agrega valor sem quebrar as anteriores

### Parallel Team Strategy

Com múltiplos devs:

1. Todos: Setup + Foundational juntos
2. Após Foundational:
   - Dev A: US1 (card)
   - Dev B: US2 (seção)
3. Após US2: Dev B (ou C): US3 (diagrama)

---

## Notes

- [P] = arquivos diferentes, sem dependências
- Rótulo [Story] mapeia a tarefa à user story para rastreabilidade
- Cada user story é completável e testável independentemente
- Commitar após cada tarefa ou grupo lógico
- Pare nos checkpoints para validar a story isoladamente
- Evitar: tarefas vagas, conflitos no mesmo arquivo, dependências entre stories
