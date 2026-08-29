---

description: "Task list for Placeholders obrigatórios por tipo de prompt + validação ao salvar"

---

# Tasks: Placeholders obrigatórios por tipo de prompt + validação ao salvar

**Input**: Design documents from `specs/026-prompt-type-placeholders/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/placeholder-validation.md](./contracts/placeholder-validation.md), [quickstart.md](./quickstart.md)

**Tests**: incluídos e obrigatórios — a constituição do projeto (princípio IV) declara testes não negociáveis. Testes RTL com queries acessíveis e interações reais, padrão AAA, mocks de API.

**Organization**: tarefas agrupadas por user story (spec.md), na ordem de prioridade P1 → P2. Sem mudança de API/contrato (feature frontend-only).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1..US4, mapeando para spec.md — ausente em Setup/Foundational/Polish
- Caminhos de arquivo são relativos à raiz do repositório

---

## Phase 1: Setup

**Purpose**: baseline limpa antes de qualquer mudança.

- [X] T001 Rodar `npm test` e `npm run lint` na branch `026-prompt-type-placeholders` e registrar quaisquer falhas/avisos pré-existentes, para não confundi-los com esta feature — baseline: 8 suítes de teste já falhavam (`TenantManagement`, `Header`, `Footer`, `PromptFormModal`, `PromptPlaceholderHelp`, `pythonBackend`, `tenantSchemas`, `ChatWidget`) e o lint já tinha 9 erros/6 avisos pré-existentes, todos fora do escopo desta feature

**Checkpoint**: baseline confirmada.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: fonte única do mapa de placeholders + funções puras de validação — tudo que as user stories consomem.

**⚠️ CRITICAL**: nenhuma user story pode começar antes desta fase.

- [X] T002 Criar `src/lib/promptPlaceholders.ts`: mover o mapa estático de `src/components/admin/prompt-manager/promptPlaceholderHelp.ts` (interfaces `PromptPlaceholder`, `PromptPlaceholderHelpEntry`, `PromptPlaceholderHelpMap` + mapa com as 3 entradas exatas de `data-model.md`, sem alterar tokens/descrições/exemplos), importando `NodeType` de `@/services/promptManager.types`
- [X] T003 Adicionar funções puras em `src/lib/promptPlaceholders.ts`: `requiredPlaceholdersFor(nodeType)` (tokens com `required === true`, na ordem do mapa) e `missingRequiredPlaceholders(content, nodeType)` (filtra por `content.includes(token)` — verificação literal, sensível a maiúsculas/chaves; `nodeType` imprevisto retorna lista vazia, nunca lança) (depends on: T002)
- [X] T004 [P] Testes unitários em `src/lib/promptPlaceholders.test.ts`: listas por tipo (operational 6 / institutional 4 / chitchat 1), ordenação, verificação literal (variações de casing/espaçamento NÃO contam), conteúdo vazio, token repetido conta como presente, `nodeType` inválido → lista vazia (depends on: T003)
- [X] T005 [P] Atualizar `src/components/admin/prompt-manager/PromptPlaceholderHelp.tsx` para importar o mapa de `@/lib/promptPlaceholders` e excluir `src/components/admin/prompt-manager/promptPlaceholderHelp.ts` — confirmar com busca que nenhum outro arquivo importa o módulo antigo (depends on: T002)

**Checkpoint**: lib pronta — implementação das user stories pode começar (US1/US2 em paralelo, US3/US4 após as anteriores).

---

## Phase 3: User Story 1 - Validar placeholders obrigatórios ao salvar (Priority: P1) 🎯 MVP

**Goal**: ao salvar um prompt (criação ou edição), verificar os obrigatórios do `node_type` atual; se houver ausentes, alertar com "Corrigir" (formulário intacto) ou "Salvar mesmo assim" (prossegue).

**Independent Test**: novo prompt tipo "Chitchat" com conteúdo sem `{guardrails}` → salvar mostra alerta listando `{guardrails}`; "Corrigir" mantém tudo; repetir e "Salvar mesmo assim" salva. Prompt completo → nenhum alerta.

### Tests for User Story 1 ⚠️

> **NOTE: escrever PRIMEIRO e garantir que FALHAM antes da implementação**

- [X] T006 [P] [US1] Testes RTL em `src/components/admin/prompt-manager/PromptFormModal.test.tsx`: conteúdo sem obrigatório(s) → alerta lista os ausentes e `onSubmit` NÃO é chamado; "Corrigir" mantém título/conteúdo/tipo/guardrails intactos; "Salvar mesmo assim" chama `onSubmit` com os dados; conteúdo completo → sem alerta (mock de `onSubmit` como nos testes existentes; queries acessíveis)
- [X] T007 [P] [US1] Testes RTL em `src/components/admin/prompt-manager/MissingPlaceholdersAlert.test.tsx` (arquivo novo — componente ainda não existe, deve falhar): renderiza cada `missingToken` em `<code>`, expõe `role="alertdialog"` e `aria-label` descritivo, botões "Corrigir" e "Salvar mesmo assim" invocam `onFix`/`onSaveAnyway`

### Implementation for User Story 1

- [X] T008 [US1] Criar `src/components/admin/prompt-manager/MissingPlaceholdersAlert.tsx` conforme `contracts/placeholder-validation.md` §2: overlay interno do dialog com `role="alertdialog"`/`aria-label`, lista dos tokens ausentes em `<ul>/<li>` com `<code>`, botões "Corrigir" (`onFix`) e "Salvar mesmo assim" (`onSaveAnyway`), Tailwind com tokens existentes (`rounded-card`, `bg-surface-base`, `border-brand-primary/30`), foco inicial em "Corrigir" (depends on: T007)
- [X] T009 [US1] Em `src/components/admin/prompt-manager/PromptFormModal.tsx`: interceptar o submit — calcular `missingRequiredPlaceholders(conteudo, node_type)` com os valores atuais do formulário; se houver ausentes, armazenar os tokens em estado local e NÃO chamar `onSubmit` (depends on: T003)
- [X] T010 [US1] Em `src/components/admin/prompt-manager/PromptFormModal.tsx`: renderizar `MissingPlaceholdersAlert` dentro do `AdminDialog` quando o estado estiver ativo — "Corrigir" fecha o alerta (formulário intacto, FR-008); "Salvar mesmo assim" executa o submit pendente exatamente como o fluxo normal (FR-009) (depends on: T008, T009)

**Checkpoint**: US1 completa e testável de forma independente — MVP entregue.

---

## Phase 4: User Story 2 - Exibir somente os placeholders obrigatórios do tipo (Priority: P1)

**Goal**: a seção de ajuda exibe exclusivamente os obrigatórios do tipo selecionado — chitchat mostra só `{guardrails}`, sem sugerir tokens de outros tipos.

**Independent Test**: abrir o formulário e alternar o "Nó de Destino" — conferir listas exatas: operacional (6), institucional (4), chitchat (1); nenhum token de outro tipo aparece.

### Tests for User Story 2 ⚠️

- [X] T011 [P] [US2] Testes em `src/components/admin/prompt-manager/PromptPlaceholderHelp.test.tsx`: para cada tipo, somente os obrigatórios do tipo aparecem — asserções explícitas de que tokens de OUTROS tipos NÃO aparecem (chitchat sem `{contexto_formatado}`, `{historico_texto}` e `{pergunta_usuario}`; operational sem `{pergunta_usuario}`/`{historico_texto}`)

### Implementation for User Story 2

- [X] T012 [US2] Em `src/components/admin/prompt-manager/PromptPlaceholderHelp.tsx`: filtrar `entry.placeholders.filter(p => p.required)` para exibir somente os obrigatórios do tipo selecionado (FR-001..004) (depends on: T005)

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Refresh da tela ao trocar o tipo no dropdown (Priority: P2)

**Goal**: ao trocar o "Nó de Destino", a dica de placeholders e a seção de guardrails atualizam em sincronia com o novo tipo — seleção de guardrails preservada, globais sempre visíveis.

**Independent Test**: alternar o tipo no formulário — ajuda muda imediatamente (lista+exemplo); guardrails selecionados permanecem marcados e os globais continuam na lista com badge "Global".

### Tests for User Story 3 ⚠️

- [X] T013 [P] [US3] Testes em `src/components/admin/prompt-manager/PromptFormModal.test.tsx`: trocar "Nó de Destino" entre os 3 tipos atualiza a seção de ajuda imediatamente (sem reabrir o modal) e preserva `guardrail_ids` selecionados; guardrails globais permanecem listados com badge "Global" (reutiliza o padrão de `fireEvent.change` dos testes existentes)

### Implementation for User Story 3

- [X] T014 [US3] Em `src/components/admin/prompt-manager/PromptFormModal.tsx`: garantir que a troca de `node_type` re-renderiza a seção de guardrails em sincronia com o novo tipo SEM resetar `guardrail_ids` (revisar o efeito de `reset`; ajustar apenas se houver caminho de estado obsoleto), mantendo todos os `availableGuardrails` listados e os globais (`is_global`) sempre visíveis (FR-011/012) (depends on: T010)

**Checkpoint**: US1, US2 e US3 independentes.

---

## Phase 6: User Story 4 - Validar placeholders na customização do vínculo de tenant (Priority: P2)

**Goal**: ao salvar vínculo na tela "Vincular Tenant" com "Customização de Conteúdo" preenchida, validar os obrigatórios da aba ativa; ausentes → alerta com "Corrigir"/"Salvar mesmo assim"; override vazio → sem validação.

**Independent Test**: buscar tenant, preencher customização sem `{guardrails}` na aba "Chitchat" e salvar → alerta; "Corrigir" preserva o formulário; "Salvar mesmo assim" conclui o vínculo; vazio → salva direto.

### Tests for User Story 4 ⚠️

- [X] T015 [P] [US4] Testes em `src/components/admin/prompt-manager/TenantLinkSection.test.tsx`: override preenchido sem obrigatório(s) da aba ativa → alerta e `onLink` NÃO é chamado; "Corrigir" preserva tenant_id/prompt_id/override; "Salvar mesmo assim" chama `onLink`; override vazio → sem alerta (mock de `onLink` como nos testes existentes)

### Implementation for User Story 4

- [X] T016 [US4] Em `src/components/admin/prompt-manager/TenantLinkSection.tsx`: no submit, se `custom_content_override` (após `trim()`) não for vazio, calcular `missingRequiredPlaceholders(override, selectedNode)`; se houver ausentes, exibir `MissingPlaceholdersAlert` (reuso do componente de US1) com as mesmas duas ações; override vazio não valida (FR-015/016) (depends on: T008)

**Checkpoint**: todas as user stories independentes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: garantias transversais que não pertencem a uma única história.

- [X] T017 Conferir a implementação contra `contracts/placeholder-validation.md` §5 — nenhum item "fora de contrato" violado (sem bloqueio além do alerta, sem botão de copiar/inserir, sem mudança de payload de API) — confirmado por leitura do código final
- [X] T018 Executar `npm test` e `npm run lint` como portão de qualidade final, comparando com a baseline do T001 — 689 testes, mesmas 6 suítes pré-existentes falhando (2 delas, `PromptFormModal`/`PromptPlaceholderHelp`, corrigidas como efeito colateral desta feature), lint com os mesmos 9 erros/6 avisos pré-existentes, nenhum novo; `npx tsc --noEmit` sem erros novos nos arquivos tocados
- [ ] T019 [P] Executar o roteiro manual de `quickstart.md` e registrar o resultado — **pendente**: requer `npm run dev` e navegador, fica para o usuário validar

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — começa imediatamente
- **Foundational (Phase 2)**: depende de Setup — BLOQUEIA todas as user stories
- **US1 (Phase 3, P1)**: após Foundational — sem dependência de outras histórias
- **US2 (Phase 4, P1)**: após Foundational — independente de US1 (pode rodar em paralelo com US1; compartilha apenas a lib de T005)
- **US3 (Phase 5, P2)**: após US1 (toca `PromptFormModal.tsx`/`.test.tsx` de US1)
- **US4 (Phase 6, P2)**: após US1 (reusa `MissingPlaceholdersAlert` de T008)
- **Polish (Phase 7)**: após todas as histórias desejadas

### Within Each User Story

- Testes PRIMEIRO e devem FALHAR antes da implementação
- Implementação depois dos testes; componente compartilhado (`MissingPlaceholdersAlert`) antes do uso em T010/T016
- História completa antes de passar à próxima prioridade

### Parallel Opportunities

- Fase 2: T004 e T005 em paralelo (arquivos diferentes)
- Fase 3: T006 e T007 em paralelo (arquivos diferentes)
- US1 e US2 podem rodar em paralelo por pessoas diferentes após o checkpoint da Fase 2
- Fases 5 e 6: testes (T013, T015) em paralelo com revisão de outras histórias

---

## Parallel Example: User Story 1

```bash
# Lançar os dois testes de US1 juntos:
Task: "Testes RTL em PromptFormModal.test.tsx — alerta de ausentes, Corrigir, Salvar mesmo assim"
Task: "Testes RTL em MissingPlaceholdersAlert.test.tsx — tokens, a11y, ações"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline)
2. Complete Phase 2: Foundational (CRITICAL — bloqueia tudo)
3. Complete Phase 3: US1 — validação ao salvar com alerta
4. **STOP and VALIDATE**: testar US1 independentemente (cenários do Independent Test)
5. Entregar/demonstrar se pronto

### Incremental Delivery

1. Setup + Foundational → lib pronta
2. US1 → validar e demonstrar (MVP!)
3. US2 → exibição somente de obrigatórios → validar
4. US3 → refresh na troca de tipo → validar
5. US4 → validação do override no vínculo de tenant → validar
6. Polish → lint/testes/roteiro manual
7. Cada história agrega valor sem quebrar as anteriores

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta
- [Story] mapeia a tarefa à user story do spec.md (US1..US4)
- Cada user story é independentemente completável e testável
- Verificar que os testes falham antes de implementar
- Commitar após cada tarefa ou grupo lógico
- Parar em qualquer checkpoint para validar a história isoladamente
- Comandos de verificação (`npm test`, `npm run lint`) ficam para o usuário rodar (regra MANDATORY do CLAUDE.md)
- Evitar: tarefas vagas, conflito de mesmo arquivo, dependências cruzadas que quebrem a independência das histórias

---

## Extensão pós-implementação (fora das tarefas T001–T019 originais)

Identificada durante revisão de UI: o cadastro de **novo tenant** (`TenantForm.tsx` → `PromptSelectField.tsx`) tem um terceiro ponto de entrada que cria conteúdo de prompt ("criar novo a partir de um modelo") e não estava coberto pelas user stories originais. Confirmado com o usuário estender o escopo. Trabalho feito:

- `src/components/admin/PromptSelectField.tsx`: troca do aviso restrito a `{guardrails}` (`hasGuardrailsPlaceholder`) por `missingRequiredPlaceholders(conteudo, "operational")` — aviso não bloqueante lista TODOS os obrigatórios ausentes.
- `src/components/admin/tenants/TenantForm.tsx`: intercepta o submit de criação quando há `newPromptDraft`; se faltar algum obrigatório, exibe `MissingPlaceholdersAlert` (Corrigir/Salvar mesmo assim), mesmo padrão de US1/US4.
- `src/lib/promptContent.ts` e `promptContent.test.ts` removidos (única consumidora migrada para `src/lib/promptPlaceholders.ts`).
- Testes atualizados/adicionados: `PromptSelectField.test.tsx`, `TenantForm.test.tsx`.
