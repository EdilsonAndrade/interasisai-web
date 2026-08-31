# Tasks: Painel Admin — Prompts do Sistema (versionamento e rollback)

**Input**: Design documents from `/specs/029-system-prompts-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: Incluídos — Constitution IV (Testes Unitários) é NON-NEGOTIABLE neste projeto (ver `plan.md` Constitution Check).

**Organization**: Tarefas agrupadas por user story (US1/US2/US3, conforme spec.md) para permitir implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1, US2 ou US3 (mapeado ao spec.md)
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Projeto single (Next.js App Router): `src/app`, `src/components`, `src/services`, `src/hooks`, testes colocalizados (`*.test.ts(x)` ao lado do arquivo testado, seguindo convenção Jest já usada no repositório, ex.: `src/services/promptManager.test.ts`).

---

## Phase 1: Setup

**Purpose**: Definir os contratos de tipos usados por todas as user stories, sem lógica de negócio.

- [x] T001 [P] Criar tipos da API (entidade `SystemPrompt`, `PromptKey`, inputs e union results para list/get/update/rollback) em `src/services/systemPrompts.types.ts`, seguindo o padrão de `src/services/promptManager.types.ts` (union `{ ok: true, status, data } | { ok: false, ... }`)
- [x] T002 [P] Criar tipos locais de componentes (props de `SystemPromptList`, `SystemPromptEditor`) em `src/components/admin/system-prompts/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura compartilhada por todas as user stories — deve estar pronta antes de qualquer story.

**⚠️ CRITICAL**: Nenhuma user story pode iniciar antes desta fase estar completa.

- [x] T003 Criar o esqueleto do serviço `systemPrompts.ts` em `src/services/systemPrompts.ts`: `getBaseUrl()` (lê `NEXT_PUBLIC_PYTHON_BACKEND_URL`, igual a `promptManager.ts`), helper `requestSystemPrompts<T>()` com tratamento de erro via `normalizeApiError` de `@/lib/apiError`, e log de erro sem conteúdo de prompt (apenas `prompt_key`/status/`endpoint`) — depende de T001

**Checkpoint**: Fundação pronta — implementação das user stories pode começar.

---

## Phase 3: User Story 1 - Localizar e visualizar os prompts do sistema (Priority: P1) 🎯 MVP

**Goal**: Menu "Painel" exibe submenus "Prompts do Sistema" e "Ingestão Tenant" (esta última sem mudança); a tela "Prompts do Sistema" lista os 4 prompts com título de origem, com estados de carregamento e erro.

**Independent Test**: Acessar o painel, abrir o menu "Painel", clicar em "Prompts do Sistema" e conferir que os 4 prompts aparecem listados; clicar em "Ingestão Tenant" e conferir que a tela `/admin` abre sem alterações.

### Tests for User Story 1 ⚠️

> Escrever estes testes PRIMEIRO; devem falhar antes da implementação.

- [x] T004 [P] [US1] Teste unitário do hook `useSystemPrompts` (estado inicial, carregamento, sucesso da listagem, erro de rede) com `renderHook` em `src/hooks/useSystemPrompts.test.ts`, mockando `src/services/systemPrompts.ts`
- [x] T005 [P] [US1] Teste RTL: `AdminNavigation` exibe o item "Painel" como menu com dois submenus ("Prompts do Sistema" → `/admin/system-prompts`, "Ingestão Tenant" → `/admin`), abre/fecha ao clicar e navega corretamente, em `src/components/admin/AdminNavigation.test.tsx`
- [x] T006 [P] [US1] Teste RTL: `SystemPromptList` renderiza os 4 títulos de prompt, estado de carregamento e estado de erro com opção de nova tentativa, em `src/components/admin/system-prompts/SystemPromptList.test.tsx`

### Implementation for User Story 1

- [x] T007 [US1] Implementar `fetchSystemPrompts()` (`GET /api/v1/system-prompts`) e `fetchSystemPrompt(promptKey)` (`GET /api/v1/system-prompts/{prompt_key}`, tratando 404) em `src/services/systemPrompts.ts` (depende de T003)
- [x] T008 [US1] Implementar hook `useSystemPrompts` (estado: lista, carregando, erro, `selectedPromptKey`, ação `selectPrompt`) em `src/hooks/useSystemPrompts.ts` (depende de T007)
- [x] T009 [P] [US1] Criar `SystemPromptList` (lista os prompts com título de origem, indicador de carregamento, mensagem de erro com retry) em `src/components/admin/system-prompts/SystemPromptList.tsx` (depende de T002)
- [x] T010 [US1] Criar `SystemPromptsPage` (orquestrador client: renderiza `SystemPromptList`, gerencia seleção) em `src/components/admin/system-prompts/SystemPromptsPage.tsx` (depende de T008, T009)
- [x] T011 [US1] Criar rota `src/app/[locale]/admin/system-prompts/page.tsx` (Server Component: guard de sessão via `ADMIN_SESSION_COOKIE`/`hasValidAdminSession`, `metadata`, renderiza `SystemPromptsPage`), seguindo o padrão de `src/app/[locale]/admin/prompt-manager/page.tsx` (depende de T010)
- [x] T012 [US1] Modificar `AdminNavigation` em `src/components/admin/AdminNavigation.tsx`: transformar o item "Painel" em um menu com dois submenus — "Prompts do Sistema" (`/admin/system-prompts`) e "Ingestão Tenant" (`/admin`, sem alteração de destino/comportamento) — mantendo os demais itens (WhatsApp, Tenants, Follow-up, Prompts & Guardrails, Configurações Globais) inalterados

**Checkpoint**: User Story 1 completa e testável de forma independente.

---

## Phase 4: User Story 2 - Editar e salvar o conteúdo de um prompt (Priority: P2)

**Goal**: Ao selecionar um prompt, o conteúdo vigente é exibido em campo editável; salvar grava a nova versão vigente, preserva a anterior, valida conteúdo vazio, bloqueia envio duplicado e preserva o texto digitado em caso de falha.

**Independent Test**: Selecionar um prompt na lista (US1), editar o conteúdo, salvar e conferir toast de sucesso e persistência do novo conteúdo; tentar salvar vazio e conferir bloqueio; simular falha de rede e conferir que o texto digitado não é perdido.

### Tests for User Story 2 ⚠️

- [x] T013 [P] [US2] Estender teste do hook `useSystemPrompts` (ação de salvar: sucesso atualiza estado, validação de vazio bloqueia sem chamar API, erro preserva rascunho, bloqueio de envio duplicado) em `src/hooks/useSystemPrompts.test.ts`
- [x] T014 [P] [US2] Teste RTL: `SystemPromptEditor` — editar texto, salvar com sucesso, bloqueio ao salvar vazio/só espaços, mensagem de erro em falha de API, botão desabilitado durante operação pendente, em `src/components/admin/system-prompts/SystemPromptEditor.test.tsx`

### Implementation for User Story 2

- [x] T015 [US2] Implementar `updateSystemPrompt(promptKey, { conteudo })` (`PUT /api/v1/system-prompts/{prompt_key}`, tratando 400 de conteúdo vazio) em `src/services/systemPrompts.ts` (depende de T003, T007)
- [x] T016 [US2] Estender `useSystemPrompts` com ação `savePrompt` (validação de trim/vazio antes do envio, flag `saving` por prompt, atualização do item na lista em sucesso, preservação do rascunho em erro) em `src/hooks/useSystemPrompts.ts` (depende de T015, T008)
- [x] T017 [P] [US2] Criar `SystemPromptEditor` (textarea controlada com o conteúdo vigente, botão "Salvar" desabilitado durante pendência/conteúdo vazio, mensagem de validação inline) em `src/components/admin/system-prompts/SystemPromptEditor.tsx` (depende de T002)
- [x] T018 [US2] Integrar `SystemPromptEditor` ao `SystemPromptsPage` (exibido ao selecionar um prompt da lista) em `src/components/admin/system-prompts/SystemPromptsPage.tsx` (depende de T010, T016, T017)
- [x] T019 [US2] Adicionar notificações `sonner` (toast) de sucesso ("Prompt salvo com sucesso") e erro ao salvar em `src/components/admin/system-prompts/SystemPromptEditor.tsx` (depende de T017)

**Checkpoint**: User Stories 1 e 2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Reverter um prompt para a versão anterior (Priority: P3)

**Goal**: Reverter um prompt para a versão anterior mediante confirmação explícita; a operação é reversível (aplicada duas vezes, retorna ao conteúdo original); falha não altera o conteúdo exibido.

**Independent Test**: Editar um prompt (US2) para gerar uma versão anterior, acionar "Reverter", confirmar, conferir que o conteúdo anterior volta a ser exibido; reverter novamente e conferir que retorna ao conteúdo salvo por último.

### Tests for User Story 3 ⚠️

- [x] T020 [P] [US3] Estender teste do hook `useSystemPrompts` (ação de rollback: sucesso troca o conteúdo exibido, reversibilidade em duas chamadas seguidas, erro não altera o conteúdo, flag de pendência) em `src/hooks/useSystemPrompts.test.ts`
- [x] T021 [P] [US3] Teste RTL: `SystemPromptEditor` — clique em "Reverter" abre confirmação (`AdminDialog`), confirmar aplica o rollback com toast de sucesso, cancelar não altera nada, erro exibe mensagem sem mudar o conteúdo, em `src/components/admin/system-prompts/SystemPromptEditor.test.tsx`

### Implementation for User Story 3

- [x] T022 [US3] Implementar `rollbackSystemPrompt(promptKey)` (`POST /api/v1/system-prompts/{prompt_key}/rollback`) em `src/services/systemPrompts.ts` (depende de T003)
- [x] T023 [US3] Estender `useSystemPrompts` com ação `rollbackPrompt` (flag `rollingBack` por prompt, atualiza item na lista em sucesso, mantém estado em erro) em `src/hooks/useSystemPrompts.ts` (depende de T022, T016)
- [x] T024 [US3] Adicionar botão "Reverter para versão anterior" em `SystemPromptEditor.tsx` que abre `AdminDialog` (reutilizado de `src/components/admin/AdminDialog.tsx`) pedindo confirmação antes de chamar `rollbackPrompt` (depende de T017, T023)
- [x] T025 [US3] Adicionar notificações `sonner` de sucesso ("Prompt revertido com sucesso") e erro ao reverter em `src/components/admin/system-prompts/SystemPromptEditor.tsx` (depende de T024)

**Checkpoint**: Todas as user stories funcionam de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validações finais que atravessam todas as stories.

- [ ] T026 [P] Executar a validação manual completa do `specs/029-system-prompts-panel/quickstart.md` (fluxo dos 7 passos, incluindo navegação "Ingestão Tenant" inalterada) — **pendente do usuário**: conforme guardrail do projeto, Claude não sobe servidor/navegador para testar; ver Test Guide na resposta final
- [x] T027 [P] Verificar que nenhum `console.*` registra o conteúdo textual dos prompts (apenas `prompt_key`/status) em `src/services/systemPrompts.ts` — FR-021
- [x] T028 Revisão de acessibilidade: navegação por teclado no menu "Painel" (abrir/fechar submenu, Escape), labels no textarea, foco gerenciado no `AdminDialog` de rollback
- [x] T029 Rodar `npm test` (suíte completa) e `npm run lint`, corrigindo eventuais falhas — 26/26 testes novos passando, suíte completa sem regressões (8 falhas pré-existentes em arquivos não tocados por esta feature, confirmadas via `git stash`); `npm run lint` tem 22 erros pré-existentes no padrão `react-hooks/set-state-in-effect` já presentes em outros hooks do repositório (`usePrompts.ts`, `useGuardrails.ts` etc.) — `useSystemPrompts.ts`/`SystemPromptEditor.tsx` seguem exatamente essa mesma convenção já usada no projeto

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente.
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA todas as user stories.
- **User Stories (Phase 3+)**: Todas dependem da conclusão do Foundational.
  - US2 reutiliza a tela/lista criada por US1 (mesmo componente `SystemPromptsPage`), mas sua lógica de salvar é independente e testável isoladamente via mocks.
  - US3 reutiliza `SystemPromptEditor` criado por US2, adicionando a ação de rollback; testável isoladamente via mocks do hook.
- **Polish (Phase 6)**: Depende de todas as user stories desejadas estarem completas.

### User Story Dependencies

- **US1 (P1)**: Sem dependência de outras stories. Entrega o MVP navegável (listagem).
- **US2 (P2)**: Depende de US1 estar implementada (usa `SystemPromptsPage`/`SystemPromptList` para selecionar um prompt), mas sua lógica de salvamento é isolada em `savePrompt`/`SystemPromptEditor` e testável por conta própria.
- **US3 (P3)**: Depende de US2 estar implementada (usa `SystemPromptEditor` para adicionar o botão de rollback), com lógica de `rollbackPrompt` isolada e testável por conta própria.

### Within Each User Story

- Testes antes da implementação (devem falhar primeiro).
- Serviço (API) → Hook → Componentes → Integração na página.
- Story completa antes de avançar para a próxima prioridade.

### Parallel Opportunities

- T001 e T002 (Setup) em paralelo.
- Dentro de cada story, as tarefas de teste marcadas [P] podem rodar em paralelo entre si (arquivos diferentes).
- T009 (SystemPromptList) pode ser feito em paralelo a T007/T008 até o ponto de integração (T010).
- T017 (SystemPromptEditor) pode ser feito em paralelo a T015/T016 até a integração (T018).

---

## Parallel Example: User Story 1

```bash
# Testes de US1 em paralelo:
Task: "Teste unitário useSystemPrompts (listagem) em src/hooks/useSystemPrompts.test.ts"
Task: "Teste RTL AdminNavigation (menu Painel com submenus) em src/components/admin/AdminNavigation.test.tsx"
Task: "Teste RTL SystemPromptList (4 prompts, loading, erro) em src/components/admin/system-prompts/SystemPromptList.test.tsx"

# Implementação de US1 em paralelo (após T007/T008):
Task: "Criar SystemPromptList em src/components/admin/system-prompts/SystemPromptList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1
4. **PARAR e VALIDAR**: testar US1 de forma independente (navegação + listagem)
5. Demonstrar/avaliar antes de prosseguir

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → validar independentemente → MVP navegável
3. US2 → validar independentemente → edição/salvamento funcional
4. US3 → validar independentemente → rollback funcional
5. Polish → validação final via quickstart.md

---

## Notes

- [P] = arquivos diferentes, sem dependência entre si.
- [Story] mapeia a tarefa à user story correspondente para rastreabilidade.
- Cada user story deve ser completável e testável de forma independente.
- Confirmar que os testes falham antes de implementar (TDD).
- Não alterar rota, layout ou comportamento de `/admin` (Ingestão Tenant) — apenas o item de menu que aponta para ela.
- Não remover os prompts hardcoded de fallback no backend (fora de escopo do frontend).
