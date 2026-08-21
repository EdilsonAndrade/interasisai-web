# Tasks: Ajustes de Usabilidade no Painel Administrativo (Fase 1)

**Input**: Design documents from `/specs/019-admin-ux-quick-wins/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Incluídas em todas as fases — a Constitution do projeto (Principle IV) torna testes unitários/RTL não-negociáveis para todo componente interativo e hook alterado ou criado; não é opcional aqui.

**Organization**: Tarefas agrupadas por user story (US1–US7, na ordem de prioridade do spec.md) para permitir implementação e validação independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente, sem dependência de tarefa pendente)
- **[Story]**: User story a que a tarefa pertence (US1–US7)
- Caminhos de arquivo são sempre relativos à raiz do repositório

## Phase 1: Setup

Nenhuma tarefa de setup necessária — nenhuma dependência nova, nenhuma configuração de projeto ou build a alterar (ver `plan.md` → Technical Context).

## Phase 2: Foundational

Nenhuma tarefa foundational bloqueante — cada user story é autocontida (os dois componentes novos, `DeleteAction` e `GuardrailScopeBadge`, são propriedade exclusiva de US3 e US6 respectivamente, não pré-requisito de outras stories). Ver `research.md` para o raciocínio de design completo por decisão.

---

## Phase 3: User Story 1 - Fechar modais de forma previsível (Priority: P1) 🎯 MVP

**Goal**: Corrigir `AdminDialog` para que ESC feche o modal, o backdrop escureça o fundo, o foco fique contido, e alterações não salvas em formulário gerem confirmação antes de fechar — em todos os ~8 modais do admin de uma vez.

**Independent Test**: Abrir qualquer modal (ex: "Novo Prompt"), pressionar ESC sem alterar nada → fecha. Repetir digitando algo antes do ESC → aparece confirmação de descarte.

### Implementation for User Story 1

- [X] T001 [US1] Reescrever `src/components/admin/AdminDialog.tsx` para abrir via `dialogRef.current.showModal()` num `useEffect` acionado por `open` (em vez de renderizar o atributo `open` no JSX) e fechar via `dialogRef.current.close()` quando `open` passa a `false`; manter `aria-modal`, `aria-labelledby` e o gerenciamento de foco já existentes
- [X] T002 [US1] Em `src/components/admin/AdminDialog.tsx`, adicionar prop `hasUnsavedChanges?: boolean`; interceptar o fechamento (evento `cancel`/ESC, clique no backdrop e clique no botão "X") para exibir uma confirmação inline ("Descartar alterações?") antes de chamar `onClose` quando `hasUnsavedChanges` for `true`; quando `false`/omitido, fechar imediatamente como hoje. Também adicionado `closeDisabled?: boolean` (fora do escopo literal da task, mas necessário para o Edge Case do spec.md — ESC ignorado durante submissão em andamento) e wired nos 7 call sites de `AdminDialog` na Phase 3
- [X] T003 [US1] Em `src/components/admin/AdminDialog.tsx`, aumentar a área de clique do botão de fechar ("X") para no mínimo 44x44px (ex: `min-h-11 min-w-11` ou padding equivalente), mantendo o `aria-label="Fechar"` existente
- [X] T004 [US1] Reescrever `src/components/admin/AdminDialog.test.tsx`: removido o `fireEvent(dialog, new Event("cancel", ...))` sintético; ESC agora é disparado via `fireEvent.keyDown(document, { key: "Escape" })`. jsdom 26 não implementa `showModal()`/`close()` nativamente — foi necessário adicionar um polyfill em `jest.setup.ts` (showModal/close + ESC→cancel) para o teste exercitar o caminho real. Confirmado como teste de regressão real: 6/8 casos falham rodando contra o `AdminDialog.tsx` anterior
- [X] T005 [P] [US1] Em `src/components/admin/prompt-manager/PromptFormModal.tsx`, repassar `hasUnsavedChanges={formState.isDirty}` para o `AdminDialog` (também `closeDisabled={isSubmitting}`)
- [X] T006 [P] [US1] Atualizar `src/components/admin/prompt-manager/PromptFormModal.test.tsx` cobrindo o repasse de `isDirty` como `hasUnsavedChanges`
- [X] T007 [P] [US1] Em `src/components/admin/prompt-manager/GuardrailFormModal.tsx`, repassar `hasUnsavedChanges={formState.isDirty}` para o `AdminDialog` (também `closeDisabled={isSubmitting}`)
- [X] T008 [P] [US1] Criar `src/components/admin/prompt-manager/GuardrailFormModal.test.tsx` (arquivo ainda não existia) cobrindo o repasse de `isDirty` como `hasUnsavedChanges`
- [X] T009 [US1] Em `src/components/admin/tenants/TenantForm.tsx`, adicionar prop `onDirtyChange?: (dirty: boolean) => void`, disparado via `useEffect` observando `formState.isDirty` do `useForm` interno
- [X] T010 [US1] Atualizar `src/components/admin/tenants/TenantForm.test.tsx` cobrindo `onDirtyChange` sendo chamado ao editar um campo (depende de T009)
- [X] T011 [US1] Em `src/components/admin/tenants/TenantManagement.tsx`, guardar o valor de `onDirtyChange` do `TenantForm` em `useState` e repassá-lo como `hasUnsavedChanges` ao `AdminDialog` que envolve o formulário (depende de T009). Também `closeDisabled={management.isLoading}`, e `TenantDeleteDialog`/`KnowledgeBaseDeleteDialog`/confirmações inline de `PromptList`/`GuardrailList` ganharam `closeDisabled` equivalente
- [X] T012 [US1] Atualizar `src/components/admin/tenants/TenantManagement.test.tsx` cobrindo a confirmação de descarte ao fechar o dialog de edição de tenant com alterações pendentes (depende de T011)

**Checkpoint**: Todos os modais do admin fecham com ESC, escurecem o fundo, e protegem formulários com alteração pendente — validável isoladamente sem as demais stories.

---

## Phase 4: User Story 2 - Entender a função da tela "Painel" (Priority: P1)

**Goal**: O título da tela hoje "Painel Administrador - Adicionar Novo Tenant" passa a refletir a função real (busca de tenant + gestão de base de conhecimento).

**Independent Test**: Abrir `/admin` e ler o título — não deve mencionar criação/adição de tenant.

### Implementation for User Story 2

- [X] T013 [US2] Em `src/components/admin/AdminDashboard.tsx`, trocar o texto do `<h1>` ("Painel Administrador - Adicionar Novo Tenant") por um título que comunique busca de tenant e gestão de base de conhecimento → "Buscar Tenant e Base de Conhecimento"
- [X] T014 [P] [US2] Atualizar `src/components/admin/AdminDashboard.test.tsx` para verificar o novo texto do título

**Checkpoint**: Título da tela "Painel" comunica a função real, independente das demais stories.

---

## Phase 5: User Story 3 - Diferenciar visualmente "Excluir" de "Salvar" (Priority: P2)

**Goal**: Um componente `DeleteAction` único (estilo link/texto, baixo peso visual) substitui as 4 implementações ad-hoc do botão "Excluir" hoje espalhadas em `PromptList`, `GuardrailList`, `TenantDetails` e `KnowledgeBaseEditor`, sem alterar o fluxo de confirmação já existente em cada uma.

**Independent Test**: Na tela de Base de Conhecimento de um tenant com conteúdo salvo, comparar "Salvar Base de Conhecimento" com "Excluir" — o segundo deve ser nitidamente mais discreto; a exclusão continua exigindo confirmação.

### Implementation for User Story 3

- [X] T015 [US3] Criar `src/components/admin/DeleteAction.tsx`: botão de baixo peso visual (estilo link/texto, não sólido), props `label` (default `"Excluir"`), `onClick`, `disabled?`, mantendo semântica de botão e `aria-label` configurável
- [X] T016 [P] [US3] Criar `src/components/admin/DeleteAction.test.tsx` cobrindo renderização, disparo de `onClick` e estado `disabled`
- [X] T017 [US3] Em `src/components/admin/prompt-manager/PromptList.tsx`, substituir o botão "Excluir" (ícone `Trash2`) de cada item da lista por `DeleteAction`, mantendo o modal de confirmação (`AdminDialog`) inalterado (depende de T015)
- [X] T018 [P] [US3] Em `src/components/admin/prompt-manager/GuardrailList.tsx`, substituir o botão "Excluir" de cada item por `DeleteAction`, mantendo o modal de confirmação inalterado (depende de T015)
- [X] T019 [P] [US3] Em `src/components/admin/tenants/TenantDetails.tsx`, substituir o botão "Excluir" do cabeçalho por `DeleteAction`, mantendo o disparo de `onDelete` (que abre `TenantDeleteDialog`) inalterado (depende de T015). Sem `ariaLabel` customizado (contexto de item único, mantém nome acessível "Excluir" igual ao original)
- [X] T020 [P] [US3] Em `src/components/admin/KnowledgeBaseEditor.tsx`, substituir o botão "Excluir" por `DeleteAction`, mantendo o disparo de `KnowledgeBaseDeleteDialog` inalterado (depende de T015)
- [X] T021 [US3] Criar `src/components/admin/prompt-manager/PromptList.test.tsx` (arquivo ainda não existia) cobrindo: renderização da lista, `DeleteAction` disparando a abertura do modal de confirmação existente, e exclusão só ocorrendo após confirmar (depende de T017)
- [X] T022 [P] [US3] Criar `src/components/admin/prompt-manager/GuardrailList.test.tsx` (arquivo ainda não existia) cobrindo o mesmo fluxo de exclusão via `DeleteAction` (depende de T018)
- [X] T023 [P] [US3] Atualizar `src/components/admin/tenants/TenantDetails.test.tsx` cobrindo o botão `DeleteAction` disparando `onDelete` (depende de T019)
- [X] T024 [P] [US3] Atualizar `src/components/admin/KnowledgeBaseEditor.test.tsx` cobrindo o botão `DeleteAction` abrindo o diálogo de confirmação (depende de T020) — testes existentes já cobriam o fluxo completo via nome acessível "Excluir" inalterado; nenhuma mudança foi necessária

**Checkpoint**: "Excluir" é visualmente discreto nas 4 telas afetadas, sem regressão no fluxo de confirmação — validável isoladamente.

---

## Phase 6: User Story 4 - Buscar um prompt na lista de Prompts Base (Priority: P2)

**Goal**: Campo de busca client-side na aba "Prompts Base", filtrando por título (case/acento-insensível), com mensagem própria para "nenhum resultado".

**Independent Test**: Digitar parte de um título existente no campo de busca — lista filtra em tempo real; termo sem correspondência mostra mensagem de "nenhum resultado"; limpar o campo restaura a lista completa.

### Implementation for User Story 4

- [X] T025 [US4] Em `src/components/admin/prompt-manager/PromptList.tsx`, adicionar `useState<string>` local (`query`) e um campo de busca por título acima da lista; normalizar comparação (minúsculas, sem acento) ao filtrar `prompts` antes de renderizar (depende de T017)
- [X] T026 [US4] Em `src/components/admin/prompt-manager/PromptList.tsx`, adicionar estado vazio "Nenhum prompt encontrado para <termo>" distinto do estado vazio "Nenhum prompt cadastrado", exibido quando o filtro não retorna nenhum item (mesmo arquivo de T025, sequencial)
- [X] T027 [US4] Atualizar `src/components/admin/prompt-manager/PromptList.test.tsx` cobrindo: filtro reduz a lista corretamente, limpar o campo restaura a lista completa, mensagem de "nenhum resultado" aparece quando aplicável (depende de T021, T026)

**Checkpoint**: Busca funciona isoladamente na aba Prompts Base, sem depender de US3 além do arquivo já modificado.

---

## Phase 7: User Story 5 - Diferenciar prompts com título duplicado (Priority: P3)

**Goal**: Quando dois prompts compartilham título, a badge de nó já existente (`NODE_LABELS`) funciona como diferenciador primário; em caso de empate total (mesmo título e mesmo nó), um fragmento curto do `id` é anexado como critério de desempate.

**Independent Test**: Com dois prompts de mesmo título e nós diferentes na lista, dá para apontar qual é qual sem abrir nenhum dos dois.

### Implementation for User Story 5

- [X] T028 [US5] Em `src/components/admin/prompt-manager/PromptList.tsx`, detectar títulos duplicados na lista (filtrada) exibida; quando título **e** `node_type` colidirem entre dois ou mais prompts, anexar um identificador curto baseado em `id` (últimos 6 caracteres) ao lado do título de cada um para desempate (depende de T026)
- [X] T029 [US5] Atualizar `src/components/admin/prompt-manager/PromptList.test.tsx` cobrindo: dois prompts com título igual e nós diferentes continuam distinguíveis pela badge de nó já existente; dois prompts com título e nó iguais recebem o identificador de desempate (depende de T027, T028)

**Checkpoint**: Prompts duplicados são diferenciáveis na listagem sem alterar nenhum dado armazenado.

---

## Phase 8: User Story 6 - Entender o que significa a badge "Global" (Priority: P3)

**Goal**: Um componente `GuardrailScopeBadge` único (rótulo "Global" padronizado + tooltip acessível por hover e foco de teclado) substitui as 4 renderizações divergentes hoje presentes em `PromptList`, `GuardrailList`, `PromptFormModal` e `TenantLinkSection`.

**Independent Test**: Passar o mouse ou navegar por Tab até a badge "Global" em qualquer uma das 4 telas — mesmo rótulo e mesma explicação em todas.

### Implementation for User Story 6

- [X] T030 [US6] Criar `src/components/admin/GuardrailScopeBadge.tsx`: badge com rótulo único "Global" e tooltip acessível (visível em `:hover` e `:focus-visible`/`:focus-within`, associado via `aria-describedby` num `<span tabIndex={0}>` — evita aninhar um `<button>` dentro dos `<label>` de checkbox do `PromptFormModal`), prop `isGlobal: boolean` (não renderiza nada quando `false`, substituindo o rótulo "Específico" hoje mostrado)
- [X] T031 [P] [US6] Criar `src/components/admin/GuardrailScopeBadge.test.tsx` cobrindo: rótulo "Global" renderizado quando `isGlobal=true`, nada renderizado quando `isGlobal=false`, texto do tooltip acessível via `aria-describedby`, badge alcançável por foco de teclado
- [X] T032 [US6] Em `src/components/admin/prompt-manager/PromptList.tsx`, substituir o texto `"(G)"` nos chips de guardrail por `GuardrailScopeBadge` (depende de T030, T028)
- [X] T033 [P] [US6] Em `src/components/admin/prompt-manager/GuardrailList.tsx`, substituir a badge `"Global"/"Específico"` por `GuardrailScopeBadge` (depende de T030, T018)
- [X] T034 [P] [US6] Em `src/components/admin/prompt-manager/PromptFormModal.tsx`, substituir a badge `"Global"` do seletor de guardrails por `GuardrailScopeBadge` (depende de T030, T005)
- [X] T035 [P] [US6] Em `src/components/admin/prompt-manager/TenantLinkSection.tsx`, substituir a badge `"Global"` por `GuardrailScopeBadge` (depende de T030)
- [X] T036 [US6] Atualizar `src/components/admin/prompt-manager/PromptList.test.tsx` cobrindo `GuardrailScopeBadge` renderizado para guardrails globais nos chips (depende de T029, T032)
- [X] T037 [P] [US6] Atualizar `src/components/admin/prompt-manager/GuardrailList.test.tsx` cobrindo o mesmo (depende de T022, T033)
- [X] T038 [P] [US6] Atualizar `src/components/admin/prompt-manager/PromptFormModal.test.tsx` cobrindo o mesmo (depende de T006, T034)
- [X] T039 [P] [US6] Atualizar `src/components/admin/prompt-manager/TenantLinkSection.test.tsx` cobrindo o mesmo (depende de T035)

**Checkpoint**: Rótulo e explicação de "Global" são consistentes nas 4 telas — validável isoladamente.

---

## Phase 9: User Story 7 - Ver claramente quando um tenant nunca foi atualizado (Priority: P3)

**Goal**: O campo "Atualizado em" de um tenant sem valor deixa de exibir o texto literal "Não informado", passando a exibir "Nunca atualizado" — sem alterar o comportamento de `created_at`/`deleted_at`.

**Independent Test**: Consultar um tenant recém-criado (nunca editado) — o campo não mostra "Não informado".

### Implementation for User Story 7

- [X] T040 [US7] Em `src/components/admin/tenants/TenantDetails.tsx`, ajustar a renderização específica do campo "Atualizado em" para exibir "Nunca atualizado" quando `tenant.updated_at` for nulo — implementado via segundo parâmetro `emptyLabel` em `formatDate` (default `"Não informado"`, preservado para `created_at`/`deleted_at`), não uma função separada (depende de T019)
- [X] T041 [US7] Atualizar `src/components/admin/tenants/TenantDetails.test.tsx` cobrindo: tenant com `updated_at` nulo exibe "Nunca atualizado". Teste de `created_at` nulo foi descartado: o tipo `Tenant.created_at` é `string` não-anulável no contrato real (`pythonBackend.types.ts`), cenário sem correspondência real (depende de T023, T040)

**Checkpoint**: Copy do campo "Atualizado em" corrigida — validável isoladamente.

---

## Phase 10: Polish & Cross-Cutting Concerns

- [X] T042 [P] Rodar `npm run lint` e `tsc --noEmit` e corrigir quaisquer erros novos introduzidos nos arquivos tocados por US1–US7. Um erro novo encontrado e corrigido: `react-hooks/set-state-in-effect` em `AdminDialog.tsx` (setState síncrono dentro de efeito) — resolvido movendo o reset de `pendingDiscardConfirm` para o padrão de ajuste de estado durante o render (comparação com `wasOpen`), documentado no próprio arquivo. Erros/warnings restantes no lint e no `tsc --noEmit` são pré-existentes (confirmado via `git stash`), não relacionados a esta feature
- [X] T043 [P] Rodar a suíte completa (`npm test`) e confirmar ausência de regressões em testes não relacionados a esta feature — 383/385 passaram; as 2 falhas (`Footer.test.tsx`, `Header.test.tsx`) são pré-existentes e não tocadas por esta feature (confirmado via `git stash`)
- [ ] T044 Executar o roteiro manual em `specs/019-admin-ux-quick-wins/quickstart.md` (desktop + uma viewport mobile) e registrar quaisquer desvios. **NÃO EXECUTADO nesta sessão**: sem ferramenta de browser conectada, e as tentativas de gerar um token de sessão admin válido (para acessar `/admin` autenticado) e de fazer requisições de rede ao servidor de dev local foram bloqueadas pelo classificador de segurança do ambiente — corretamente, por envolverem secret de sessão/rede. Requer validação manual do usuário ou uma sessão com ferramentas de browser habilitadas

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup / Foundational**: N/A — nenhuma tarefa bloqueante compartilhada.
- **User Stories (Phase 3–9)**: cada uma pode começar imediatamente; a ordem sugerida segue a prioridade do spec (P1 → P1 → P2 → P2 → P3 → P3 → P3) porque várias stories tocam os mesmos arquivos (`PromptList.tsx`, `GuardrailList.tsx`, `TenantDetails.tsx`) — ver "Sobreposição de arquivos" abaixo.
- **Polish (Phase 10)**: depende de todas as stories desejadas estarem completas.

### Sobreposição de arquivos entre stories

- `PromptList.tsx` / `PromptList.test.tsx`: US3 (T017, T021) → US4 (T025–T027) → US5 (T028–T029) → US6 (T032, T036). Execução sequencial nessa ordem dentro do arquivo.
- `GuardrailList.tsx` / `GuardrailList.test.tsx`: US3 (T018, T022) → US6 (T033, T037).
- `TenantDetails.tsx` / `TenantDetails.test.tsx`: US3 (T019, T023) → US7 (T040–T041).
- `PromptFormModal.tsx` / `PromptFormModal.test.tsx`: US1 (T005–T006) → US6 (T034, T038).
- Demais arquivos (`AdminDialog.tsx`, `AdminDashboard.tsx`, `KnowledgeBaseEditor.tsx`, `TenantForm.tsx`, `TenantManagement.tsx`, `GuardrailFormModal.tsx`, `TenantLinkSection.tsx`, `DeleteAction.tsx`, `GuardrailScopeBadge.tsx`) não têm sobreposição entre stories.

### Parallel Opportunities

- Dentro de US1: T005–T008 (PromptFormModal/GuardrailFormModal) podem rodar em paralelo entre si e com T009–T010 (TenantForm), todos depois de T001–T004 (AdminDialog).
- Dentro de US3: T018, T019, T020 (GuardrailList, TenantDetails, KnowledgeBaseEditor) podem rodar em paralelo entre si, depois de T015 (DeleteAction); o mesmo vale para os testes correspondentes T022–T024.
- Dentro de US6: T033, T034, T035 (GuardrailList, PromptFormModal, TenantLinkSection) podem rodar em paralelo entre si, depois de T030; o mesmo vale para T037–T039.
- Entre stories: US2 (T013–T014) é totalmente independente e pode rodar a qualquer momento em paralelo com qualquer outra story.

---

## Implementation Strategy

### MVP First

1. Completar Phase 3 (US1 — fechamento de modal). É o problema estrutural de maior alcance e não depende de nenhuma outra story.
2. Completar Phase 4 (US2 — título da tela Painel). Trivial e independente.
3. **Parar e validar**: rodar o roteiro US1+US2 do `quickstart.md`.

### Incremental Delivery

1. US1 + US2 (P1) → validar → entregar.
2. US3 + US4 (P2) → validar → entregar (atenção à ordem sequencial dentro de `PromptList.tsx`: US3 antes de US4).
3. US5 + US6 + US7 (P3) → validar → entregar (US5 e US6 também sequenciais dentro de `PromptList.tsx`/`GuardrailList.tsx`, na ordem T028 → T032).
4. Phase 10 (Polish) ao final.

---

## Notes

- Nenhum contrato de API novo — todas as mudanças são de apresentação/estado local, conforme `data-model.md`.
- `DeleteAction` e `GuardrailScopeBadge` (T015, T030) reduzem duplicação existente (4 implementações ad-hoc cada) — não introduzem abstração nova sem necessidade concreta já mapeada em `research.md`.
- Sempre confirmar que o teste correspondente falha antes da mudança de implementação (TDD leve), especialmente T004 (`AdminDialog.test.tsx`), que hoje passa por um falso positivo.
