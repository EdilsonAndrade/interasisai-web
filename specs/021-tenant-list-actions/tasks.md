---

description: "Task list for Exclusão com confirmação de impacto, edição e atalho WhatsApp na tela de tenant"
---

# Tasks: Exclusão com confirmação de impacto, edição e atalho WhatsApp na tela de tenant

**Input**: Design documents from `specs/021-tenant-list-actions/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api-contract.md](./contracts/api-contract.md), [quickstart.md](./quickstart.md)

**Tests**: incluídos e obrigatórios — a constituição do projeto (princípio IV) declara testes não negociáveis. Todo hook novo tem teste com `renderHook`; todo componente interativo tem teste RTL com queries acessíveis; padrão AAA; API sempre mockada.

**Organization**: tarefas agrupadas por user story (spec.md), na ordem de prioridade P1 → P2 → P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1..US3, mapeando para spec.md — ausente em Setup, Foundational e Polish
- Caminhos de arquivo são relativos à raiz do repositório

---

## Phase 1: Setup

**Purpose**: estabelecer uma baseline limpa antes de qualquer mudança — o backend do EDI-45 ainda está em desenvolvimento em paralelo, então (diferente de features anteriores) não há como validar o contrato contra um backend rodando agora; essa validação fica para o final (`quickstart.md`), por instrução explícita do usuário.

- [X] T001 Rodar `npm test`, `npm run lint` e `npm run build` na branch atual para confirmar que não há falhas pré-existentes que possam ser confundidas com esta feature — baseline: 5 erros de lint pré-existentes em `usePrompts.ts` e outros arquivos não tocados por esta feature; 2 testes falhando pré-existentes (`Header.test.tsx`, `Footer.test.tsx`), ambos não relacionados

**Checkpoint**: baseline limpa confirmada.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestrutura consumida por múltiplas user stories.

Nenhuma tarefa bloqueante identificada — as três user stories tocam hooks e trechos de tela distintos (impacto de exclusão / prompts por node_type / atalho WhatsApp) e só compartilham componentes já existentes e prontos para reuso sem alteração (`AdminDialog`, `GuardrailScopeBadge`). As user stories podem começar imediatamente após a Fase 1.

**Checkpoint**: nenhuma pendência — segue direto para a Fase 3.

---

## Phase 3: User Story 1 - Excluir tenant sem surpresas (Priority: P1) 🎯 MVP

**Goal**: o modal de exclusão busca o resumo de impacto antes de qualquer ação destrutiva, exige nome exato do tenant para habilitar a confirmação, e trata prompts/guardrails de forma independente.

**Independent Test**: abrir o fluxo de exclusão de um tenant com prompts/guardrails mistos (exclusivos e compartilhados/globais) e verificar que o resumo separa os grupos corretamente, que o botão só habilita com o nome certo, e que cancelar/Esc não muda nada.

### Implementation for User Story 1

- [X] T002 [P] [US1] Adicionar `TenantDeleteImpactPromptItem`, `TenantDeleteImpactGuardrailItem`, `TenantDeleteImpact` e `TenantDeleteImpactResult` a `src/services/pythonBackend.types.ts` (data-model.md §TenantDeleteImpact, contract §GET delete-impact)
- [X] T003 [US1] Adicionar `fetchTenantDeleteImpact(tenantId, signal)` a `src/services/pythonBackend.ts`, reaproveitando `tenantFailure`/`normalizeApiError` (mesmo padrão de `getTenantById`) e um validador `isTenantDeleteImpact` análogo a `isTenant` (contract §GET `/tenants/{id}/delete-impact`) (depends on: T002)
- [X] T004 [US1] Criar `src/hooks/useTenantDeleteImpact.ts`: estado `idle|loading|loaded|error`, `fetchImpact(tenantId)`, `impact`, `error`, `clear()` — nunca assume dado local, sempre vem da resposta do servidor (FR-001, FR-008) (depends on: T003)
- [X] T005 [US1] Reescrever `src/components/admin/tenants/TenantDeleteDialog.tsx`: recebe `impactState`, `impact`, `impactError`, `onRetryImpact`, `tenantName`, `confirmText`, `onConfirmTextChange` como props; renderiza os 4 grupos (`prompts_to_delete`, `prompts_to_unlink_only`, `guardrails_to_delete`, `guardrails_to_unlink_only`) nomeando os itens, usando `GuardrailScopeBadge` nos itens de `guardrails_to_unlink_only` com `is_global: true`; campo de texto obrigatório "Digite o nome do tenant para confirmar"; botão "Confirmar" desabilitado enquanto `confirmText.trim() !== tenantName` ou `impactState !== "loaded"`; erro de impacto exibido sem liberar o campo (FR-001..FR-009, data-model.md — regra de habilitação)
- [X] T006 [US1] Em `src/components/admin/tenants/TenantManagement.tsx`: ao abrir o modal de exclusão, chamar `impact.fetchImpact(tenant.id)`; resetar `confirmText` e `impact.clear()` ao fechar (cancelar/Esc/sucesso); repassar tudo a `TenantDeleteDialog` (depends on: T004, T005)

### Tests for User Story 1

- [X] T007 [P] [US1] Teste de `fetchTenantDeleteImpact` — sucesso com os 4 grupos, `404` vira `TENANT_NOT_FOUND`, payload malformado vira `502`, falha de rede, em `src/services/pythonBackend.test.ts`
- [X] T008 [P] [US1] Teste de `useTenantDeleteImpact` (`renderHook`) — transições de estado, `clear()` reseta tudo, em `src/hooks/useTenantDeleteImpact.test.ts`
- [X] T009 [US1] Teste de `TenantDeleteDialog` — 4 grupos exibidos separadamente com badge global em `guardrails_to_unlink_only`; botão desabilitado até nome exato (inclusive com espaço extra digitado); Cancelar/Esc não disparam nenhuma chamada; erro na busca do impacto bloqueia o campo de nome; caso independente (prompt exclusivo + guardrail global) aparece nos grupos corretos, em `src/components/admin/tenants/TenantDeleteDialog.test.tsx`

**Checkpoint**: US1 completa e testável de forma independente — nenhuma exclusão acontece sem confirmação de impacto e nome exato.

---

## Phase 4: User Story 2 - Ver prompts e guardrails do tenant com destaque para os globais (Priority: P2)

**Goal**: o card do tenant mostra prompts vinculados nos três `node_type` e destaca guardrails globais com o badge já existente no projeto.

**Independent Test**: consultar um tenant com prompts nos três tipos de nó e guardrails mistos; verificar que os três tipos aparecem rotulados e que os guardrails globais têm o selo "Global".

### Implementation for User Story 2

- [X] T010 [P] [US2] Criar `src/hooks/useTenantNodePrompts.ts`: `fetchAll(tenantId)` chama `fetchTenantPromptDetail(tenantId, nodeType)` para `operational`, `institutional` e `chitchat` em paralelo (`Promise.all`), devolvendo um mapa por `node_type` com o mesmo vocabulário de estado de `useTenantPromptBinding` (`idle|loading|linked|missing|error`) (research.md item 4)
- [X] T011 [US2] Em `src/components/admin/TenantPromptBindingCard.tsx`: adicionar `<GuardrailScopeBadge isGlobal={g.is_global} />` a cada item de `GuardrailsSection` (componente já existe, só falta o uso) (FR-011)
- [X] T012 [US2] Estender `src/components/admin/tenants/TenantDetails.tsx` para exibir os prompts `institutional`/`chitchat` (rótulo do tipo + guardrails com badge global), lado a lado com o card operacional já existente; estado `missing` nesses dois tipos é neutro (sem alerta nem CTA de correção, que continuam exclusivos do operacional) (FR-009, FR-010, data-model.md — estado por node_type) (depends on: T010, T011)
- [X] T013 [US2] Fiar `useTenantNodePrompts` em `src/components/admin/tenants/TenantManagement.tsx`: `fetchAll(tenant.id)` ao consultar/exibir um tenant, repassando o estado a `TenantDetails` (depends on: T010, T012)

### Tests for User Story 2

- [X] T014 [P] [US2] Teste de `useTenantNodePrompts` (`renderHook`) — as três chamadas disparam em paralelo (não em série); estado por `node_type` correto, em `src/hooks/useTenantNodePrompts.test.ts`
- [X] T015 [P] [US2] Teste de `TenantPromptBindingCard` — badge "Global" aparece só nos guardrails com `is_global: true`, em `src/components/admin/TenantPromptBindingCard.test.tsx`
- [X] T016 [US2] Teste de `TenantDetails` — os três `node_type` aparecem rotulados; institucional/chitchat sem vínculo mostram mensagem neutra, sem alerta nem CTA, em `src/components/admin/tenants/TenantDetails.test.tsx`

**Checkpoint**: US1 + US2 juntas cobrem o núcleo de confiança do ticket — o admin decide exclusão com contexto completo e visível.

---

## Phase 5: User Story 3 - Ir direto para configurar o WhatsApp do tenant (Priority: P3)

**Goal**: atalho no card do tenant que leva à tela de instâncias de WhatsApp com Tenant ID e Nome da Instância pré-preenchidos e editáveis.

**Independent Test**: a partir de um tenant específico, clicar no atalho WhatsApp e verificar que a tela abre com os dois campos preenchidos e editáveis.

### Implementation for User Story 3

- [X] T017 [P] [US3] Adicionar botão/link "WhatsApp" em `src/components/admin/tenants/TenantDetails.tsx`, navegando para `/admin/whatsapp?tenantId={id}&instanceName={nome}` (valores com `encodeURIComponent`) (FR-012, FR-013)
- [X] T018 [US3] Estender `src/components/admin/WhatsAppInstanceForm.tsx` para ler `useSearchParams()` (`tenantId`, `instanceName`) e usá-los como `defaultValues` do `useForm`, permanecendo editáveis (FR-014)

### Tests for User Story 3

- [X] T019 [P] [US3] Teste de `TenantDetails` — o atalho WhatsApp aponta para a URL com `tenantId` e `instanceName` corretos, em `src/components/admin/tenants/TenantDetails.test.tsx`
- [X] T020 [P] [US3] Teste de `WhatsAppInstanceForm` — campos vêm pré-preenchidos a partir da query string e continuam editáveis; ausência de query string mantém o comportamento atual (campos vazios), em `src/components/admin/WhatsAppInstanceForm.test.tsx`

**Checkpoint**: as três user stories funcionam de forma independente.

---

## Phase 5.5: User Story 4 - Ver todos os tenants em um grid e abrir o detalhe ao clicar (Priority: P1)

**Adicionada após a implementação inicial**: o backend disponibilizou `GET /tenants/list` (dedicado, separado de `GET /tenants`), destravando o item A original do ticket (ver `research.md` item 10 e `spec.md` US4).

**Goal**: a tela de tenants abre com um grid (ID + nome) de todos os tenants, paginado; clicar numa linha popula o card de detalhe abaixo, sem esconder o grid.

**Independent Test**: abrir a tela de tenants sem digitar nada e verificar que o grid já aparece populado; clicar numa linha mostra o detalhe daquele tenant; paginar avança/volta corretamente.

### Implementation for User Story 4

- [X] T025 [P] [US4] Adicionar `TenantGridPromptTag`, `TenantGridGuardrailTag`, `TenantGridItem`, `TenantListResult` a `src/services/pythonBackend.types.ts` (data-model.md §TenantGridItem)
- [X] T026 [US4] Adicionar `listTenants({q?, limit?, offset?}, signal)` a `src/services/pythonBackend.ts`, hitting `GET /api/v1/tenants/list`, **sem alterar** `searchTenants`/`GET /tenants` (contract §GET /tenants/list) (depends on: T025)
- [X] T027 [US4] Criar `src/hooks/useTenantGrid.ts`: `fetchPage(offset)` com `limit` fixo em 20, `items`, `total`, `offset`, `hasPrevious`/`hasNext` derivados, `goToPrevious`/`goToNext` (FR-016, FR-017) (depends on: T026)
- [X] T028 [US4] Criar `src/components/admin/tenants/TenantGrid.tsx`: tabela com colunas ID/Nome (só esses dois campos, por decisão do usuário), linha inteira clicável via `<button>`, botões Anterior/Próxima desabilitados nas pontas, estados de loading/erro/vazio (FR-016..FR-018)
- [X] T029 [US4] Em `src/components/admin/tenants/TenantManagement.tsx`: `grid.fetchPage(0)` no mount; renderizar `TenantGrid` sempre visível acima da seção "Consultar por ID"; clique na linha chama `management.lookup(id)` (mesmo caminho da busca manual, nunca os dados do item de grid diretamente) (FR-018, FR-019) (depends on: T027, T028)
- [X] T030 [US4] Rebuscar a página corrente do grid (`grid.fetchPage(grid.offset)`) após criar, editar ou excluir um tenant com sucesso, para refletir a mudança sem refresh manual (FR-020)

### Tests for User Story 4

- [X] T031 [P] [US4] Teste de `listTenants` — parâmetros padrão e customizados na querystring, lista vazia é sucesso válido, falha normalizada, payload malformado vira 502, falha de rede, em `src/services/pythonBackend.test.ts`
- [X] T032 [P] [US4] Teste de `useTenantGrid` (`renderHook`) — `fetchPage` popula estado; `hasPrevious`/`hasNext` corretos nas três posições (primeira/meio/última página); `goToPrevious`/`goToNext` não fazem nada nas pontas; erro não apaga itens já carregados, em `src/hooks/useTenantGrid.test.ts`
- [X] T033 [P] [US4] Teste de `TenantGrid` — uma linha por tenant; clique chama `onSelect` com o id; paginação habilita/desabilita conforme `hasPrevious`/`hasNext`; estados de loading/erro/vazio escondem a tabela, em `src/components/admin/tenants/TenantGrid.test.tsx`
- [X] T034 [US4] Teste de `TenantManagement` — grid renderiza junto com a busca por ID (não mais "sem listagem"); clicar numa linha chama `management.lookup` com o id certo, em `src/components/admin/tenants/TenantManagement.test.tsx`

**Checkpoint**: as quatro user stories funcionam de forma independente — o grid é agora o ponto de entrada real da tela.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: garantias transversais que não pertencem a uma única história.

- [X] T021 [P] Regressão: confirmar que o botão "Editar" em `TenantDetails` continua abrindo o formulário com os dados atuais pré-carregados, sem mudança de comportamento após T012/T013/T017 (FR-015) — coberto por `TenantDetails.test.tsx` ("renders tenant data and active actions") e pela checagem de tipos do build
- [X] T022 [P] Auditoria de acessibilidade: `role="alert"` no erro de busca de impacto, no erro geral de exclusão (achado durante a auditoria — ver nota abaixo) e nos alertas por node_type; `<label>` associado ao campo de confirmação por nome; badges e botões novos navegáveis por teclado (elementos nativos `<button>`/`<input>`)
- [X] T023 Executar `npm test`, `npm run lint` e `npm run build` como portão de qualidade final — 477 testes (475 passando, 2 falhas pré-existentes não relacionadas, mesma baseline do T001); lint com os mesmos 5 erros/6 avisos pré-existentes, nenhum novo; build de produção concluído sem erros
- [ ] T024 Executar o roteiro de `quickstart.md` contra o backend real assim que o EDI-45 estiver disponível, registrando divergências encontradas

**Achado da auditoria (T022) corrigido durante o Polish**: `TenantDeleteDialog` não tinha como exibir a falha da própria exclusão (`DELETE /tenants/{id}`) depois de um resumo de impacto carregado com sucesso — a tela ficava sem feedback nesse caso (violação do FR-007). Corrigido com um prop `deleteError` novo, renderizado como `role="alert"` dentro do modal, ligado a `management.error` em `TenantManagement.tsx` só enquanto o modal está aberto. Coberto por um teste novo em `TenantDeleteDialog.test.tsx`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências — roda primeiro.
- **Foundational (Fase 2)**: vazia — nenhuma tarefa bloqueante identificada.
- **User Stories (Fase 3+)**: todas podem começar após a Fase 1. Entre si:
  - US1 (P1) é independente de US2/US3.
  - US2 (P2) é independente de US1, mas usa o mesmo `GuardrailScopeBadge` que US1 também usa no resumo de impacto — nenhuma delas cria o componente (já existe), então não há dependência real de código entre elas.
  - US3 (P3) é totalmente independente das outras duas.
- **Polish (Fase 6)**: depende de todas as histórias desejadas estarem completas.

### Parallel Opportunities

- T002 pode rodar isoladamente antes de T003 (mesma história, dependência direta de tipos).
- Dentro de cada história, as tarefas de teste marcadas `[P]` rodam em paralelo entre si, mas só depois das tarefas de implementação de que dependem.
- US1, US2 e US3 podem ser implementadas em paralelo por pessoas diferentes — tocam arquivos praticamente disjuntos, com exceção de `TenantManagement.tsx` (T006, T013) e `TenantDetails.tsx` (T012, T017), que são editados por mais de uma história e por isso não devem ser paralelizados entre si nesses dois arquivos.

---

## Parallel Example: User Story 1

```bash
# T002 primeiro, depois em sequência (mesma cadeia de dependência):
Task: "Adicionar tipos TenantDeleteImpact* em src/services/pythonBackend.types.ts"
Task: "Adicionar fetchTenantDeleteImpact em src/services/pythonBackend.ts"
Task: "Criar src/hooks/useTenantDeleteImpact.ts"
```

## Parallel Example: User Story 2

```bash
# Em paralelo:
Task: "Criar src/hooks/useTenantNodePrompts.ts"
Task: "Adicionar GuardrailScopeBadge em TenantPromptBindingCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Fase 1 (baseline limpa).
2. Completar Fase 3 (US1) — nenhuma exclusão acontece sem confirmação de impacto e nome exato. Esse é o núcleo de risco do ticket.
3. **PARAR e VALIDAR**: testes de US1 passando; revisão manual do fluxo de exclusão com dados mockados.

### Incremental Delivery

1. Setup → base pronta.
2. US1 → testar isoladamente → MVP (o risco de exclusão destrutiva está coberto).
3. US2 → testar isoladamente → contexto completo antes de decidir excluir.
4. US3 → testar isoladamente → conveniência de atalho.
5. Polish → portões de qualidade finais + verificação manual quando o backend do EDI-45 estiver pronto.

### Notes

- `[P]` = arquivos diferentes, sem dependência pendente.
- Rodar `npm test` (`--runInBand`), `npm run lint` e `npm run build` a cada checkpoint de história, não só no final.
- Nenhum `fetch` em arquivo `.tsx` — toda chamada nova passa por hook (princípio I da constituição).
- Parar em qualquer checkpoint para validar a história isoladamente antes de seguir para a próxima.
