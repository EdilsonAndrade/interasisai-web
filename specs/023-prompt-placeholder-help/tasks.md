---

description: "Task list for Ajuda de placeholders obrigatórios ao cadastrar prompt"

---

# Tasks: Ajuda de placeholders obrigatórios ao cadastrar prompt

**Input**: Design documents from `specs/023-prompt-placeholder-help/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: incluídos e obrigatórios — a constituição do projeto (princípio IV) declara testes não negociáveis. Componente interativo/dinâmico com teste RTL usando queries acessíveis, padrão AAA.

**Organization**: tarefas agrupadas por user story (spec.md), na ordem de prioridade P1 → P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1..US2, mapeando para spec.md — ausente em Setup e Polish
- Caminhos de arquivo são relativos à raiz do repositório

---

## Phase 1: Setup

**Purpose**: baseline limpa antes de qualquer mudança.

- [ ] T001 Rodar `npm test`, `npm run lint` e `npm run build` na branch atual e registrar quaisquer falhas/avisos pré-existentes, para não confundi-los com esta feature — **pendente**: por regra MANDATORY do CLAUDE.md, o comando fica para o usuário rodar (ver mensagem final de entrega)

**Checkpoint**: baseline confirmada.

---

## Phase 2: User Story 1 - Consultar placeholders obrigatórios e exemplo ao cadastrar prompt operational/institutional (Priority: P1) 🎯 MVP

**Goal**: seção de ajuda abaixo do campo de conteúdo, corretamente listando placeholders + exemplo para `operational` e `institutional`, atualizando ao trocar "Nó de Destino".

**Independent Test**: abrir o formulário de novo prompt, selecionar "Operacional" e conferir a lista/exemplo; trocar para "Institucional" e conferir a lista/exemplo correspondente.

### Implementation for User Story 1

- [X] T002 [P] [US1] Criar `src/components/admin/prompt-manager/promptPlaceholderHelp.ts`: mapa `PromptPlaceholderHelpMap` (tipado por `NodeType` de `promptManager.types.ts`) com entradas `operational` e `institutional` — placeholders + `required: true` + `example`, exatamente como `data-model.md` (fonte: descrição do ticket EDI-50)
- [X] T003 [US1] Criar `src/components/admin/prompt-manager/PromptPlaceholderHelp.tsx`: componente apresentacional que recebe `nodeType: NodeType`, renderiza `<section aria-label="Placeholders aceitos para este tipo de prompt">` com lista (`<ul>/<li>`) dos placeholders (token + descrição, todos marcados como obrigatórios) e o exemplo em `<pre><code>` (texto puro, sem Markdown) (depends on: T002)
- [X] T004 [US1] Renderizar `<PromptPlaceholderHelp nodeType={watch("node_type")} />` em `src/components/admin/prompt-manager/PromptFormModal.tsx`, logo abaixo do bloco `MarkdownEditorCustom` (campo "Conteúdo") — adicionar `watch("node_type")` ao lado dos `watch` já existentes (`conteudoValue`, `selectedIds`) (depends on: T003)

### Tests for User Story 1

- [X] T005 [P] [US1] Teste de `PromptPlaceholderHelp` para `node_type = "operational"` e `"institutional"` — lista mostra todos os placeholders esperados como obrigatórios, exemplo contém os tokens corretos posicionados, em `src/components/admin/prompt-manager/PromptPlaceholderHelp.test.tsx`
- [X] T006 [US1] Teste em `PromptFormModal.test.tsx` — a seção de ajuda muda de conteúdo quando o admin altera o campo "Nó de Destino" de Operacional para Institucional (reutiliza o padrão já existente de `fireEvent.change` no select)

**Checkpoint**: US1 completa e testável de forma independente — MVP do ticket entregue (cobre a causa raiz do incidente em produção).

---

## Phase 3: User Story 2 - Consultar placeholders ao cadastrar prompt chitchat sem sugerir campos inaplicáveis (Priority: P2)

**Goal**: para `node_type = chitchat`, a seção mostra apenas `{guardrails}` como obrigatório, sem mencionar `{contexto_formatado}`/`{historico_texto}`.

**Independent Test**: selecionar "Chitchat" no formulário e conferir que a seção mostra somente `{guardrails}`, sem os outros dois placeholders em nenhum lugar.

### Implementation for User Story 2

- [X] T007 [US2] Adicionar a entrada `chitchat` em `promptPlaceholderHelp.ts` (T002): apenas `{guardrails}` como placeholder, com exemplo simples usando só esse token (depends on: T002)

### Tests for User Story 2

- [X] T008 [P] [US2] Teste de `PromptPlaceholderHelp` para `node_type = "chitchat"` — lista mostra apenas `{guardrails}`; asserção explícita de que `{contexto_formatado}` e `{historico_texto}` NÃO aparecem em lugar nenhum do componente renderizado, em `PromptPlaceholderHelp.test.tsx` (mesmo arquivo de T005)

**Checkpoint**: as duas user stories funcionam de forma independente — cobertura completa dos 3 `node_type`.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: garantias transversais que não pertencem a uma única história.

- [X] T009 [P] Revisão visual/acessibilidade da seção — revisão estática confirmada: `<pre>` usa `overflow-x-auto` (bloco de exemplo nunca estoura a largura); lista é `<ul>/<li>` semântica dentro de `<section aria-label>`; obrigatoriedade indicada por texto "Obrigatório" (não só cor). **Risco conhecido, não resolvido nesta tarefa**: `AdminDialog` (`src/components/admin/AdminDialog.tsx`) não define `max-h`/`overflow-y` no `<dialog>` — em telas baixas, a seção nova pode empurrar os botões de ação para fora da área visível; corrigir isso é uma mudança no componente compartilhado `AdminDialog`, fora do escopo deste ticket (afetaria todos os modais admin). Verificar visualmente em viewport pequeno no roteiro manual do T011 e abrir um ticket separado se confirmado
- [ ] T010 Executar `npm test`, `npm run lint` e `npm run build` como portão de qualidade final, comparando com a baseline do T001 — **pendente**: comando entregue ao usuário (regra MANDATORY do CLAUDE.md)
- [ ] T011 Executar o roteiro completo de `quickstart.md` manualmente e registrar o resultado — **pendente**: requer `npm run dev` e navegador, fica para o usuário validar

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências — roda primeiro.
- **User Stories (Fase 2+)**:
  - US1 (P1) não depende de nenhuma fase anterior além do Setup — não há infraestrutura bloqueante (sem Context/hook/localStorage nesta feature).
  - US2 (P2) depende de T002 (o mesmo arquivo `promptPlaceholderHelp.ts` criado em US1) e de T003 (o componente `PromptPlaceholderHelp` já existir) — não pode ser paralelizada com a criação inicial de US1, só com os testes de US1 depois que T002/T003 existirem.
- **Polish (Fase 4)**: depende de US1 e US2 completas.

### Parallel Opportunities

- T002 → T003 → T004 formam uma cadeia direta (mesmo componente sendo construído); T005/T006 (testes de US1) rodam em paralelo entre si assim que T004 existir.
- T007 (adicionar entrada `chitchat` ao mesmo `promptPlaceholderHelp.ts` de T002) não é paralelizável com T002 (mesmo arquivo) — mas pode ser feito logo em seguida, na mesma tarefa de edição se for mais eficiente.
- T008 depende de T007.
- T009 (revisão visual) pode rodar em paralelo com T010/T011 (são inspeções independentes).

---

## Parallel Example: User Story 1

```bash
# Cadeia sequencial (mesmo componente):
Task: "Criar promptPlaceholderHelp.ts (operational + institutional)"
Task: "Criar PromptPlaceholderHelp.tsx"
Task: "Renderizar em PromptFormModal.tsx"

# Em paralelo, assim que a implementação existir:
Task: "Teste de PromptPlaceholderHelp (operational/institutional)"
Task: "Teste de troca reativa em PromptFormModal.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Fase 1 (baseline).
2. Completar Fase 2 (US1) — cobre operational e institutional, a causa raiz do incidente em produção que motivou o ticket.
3. **PARAR e VALIDAR**: rodar os testes de US1 e os passos 1–2 de `quickstart.md`.

### Incremental Delivery

1. Setup → base pronta (sem fase Foundational — feature não precisa de estado/Context novo).
2. US1 → testar isoladamente → MVP (cobre operational + institutional).
3. US2 → testar isoladamente → cobertura completa incluindo chitchat.
4. Polish → portões de qualidade finais + roteiro completo de `quickstart.md`.

### Notes

- `[P]` = arquivos diferentes, sem dependência pendente.
- Rodar `npm test`, `npm run lint` e `npm run build` a cada checkpoint de história, não só no final.
- Nenhuma lógica além de lookup síncrono em arquivo `.tsx` — o mapa de dados fica isolado em `promptPlaceholderHelp.ts` (Princípio I da constituição).
- Parar em qualquer checkpoint para validar a história isoladamente antes de seguir para a próxima.
