# Tasks: Gerenciamento Administrativo de Tenants

**Input**: Design documents from `/specs/013-admin-tenant-management/`
**Prerequisites**: `plan.md`, `spec.md`

**Tests**: A especificação solicita cobertura automatizada; tarefas de teste são obrigatórias e devem ser escritas antes da implementação correspondente.

**Organization**: As tarefas estão agrupadas por história de usuário para permitir implementação e validação incrementais. Como `research.md`, `data-model.md`, `quickstart.md` e `contracts/` ainda não existem, contratos e decisões explícitos em `spec.md` são a fonte desta lista.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode ser executada em paralelo porque altera arquivos diferentes e não depende de tarefa incompleta.
- **[Story]**: Mapeia a tarefa para sua história de usuário.
- Todos os caminhos são relativos à raiz do repositório.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar os diretórios e a documentação operacional da feature sem adicionar dependências, pois React Hook Form, Zod, Lucide e Jest/RTL já estão instalados.

- [x] T001 Criar a estrutura de diretórios da feature em src/components/admin/tenants/ e src/app/admin/tenants/
- [x] T002 Documentar configuração, limitações do endpoint de listagem e comandos de validação em specs/013-admin-tenant-management/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Criar contratos, validação e infraestrutura compartilhada que bloqueiam todas as histórias.

**CRITICAL**: Nenhuma história de usuário deve começar antes da conclusão desta fase.

- [x] T003 Definir Tenant, TenantWriteInput, falhas por campo e uniões discriminadas de resultados em src/services/pythonBackend.types.ts
- [x] T004 [P] Criar schemas Zod com trim para escrita e consulta por ID em src/lib/tenantSchemas.ts
- [x] T005 [P] Criar testes dos schemas para campos vazios, somente espaços e normalização em src/lib/tenantSchemas.test.ts
- [x] T006 Implementar parser defensivo de Tenant e normalização segura de erros sem logs de payload ou IDs em src/services/pythonBackend.ts
- [x] T007 [P] Criar componente de diálogo administrativo baseado em dialog nativo com foco, Escape e retorno de foco em src/components/admin/AdminDialog.tsx
- [x] T008 [P] Criar testes de teclado, foco, Escape e acessibilidade do diálogo em src/components/admin/AdminDialog.test.tsx
- [x] T009 Criar configuração tipada dos itens administrativos e navegação responsiva com estado ativo em src/components/admin/AdminNavigation.tsx
- [x] T010 [P] Criar testes de visibilidade autorizada, destinos, ícones e estado ativo da navegação em src/components/admin/AdminNavigation.test.tsx
- [x] T011 Centralizar proteção por cookie administrativo e renderização da navegação para rotas filhas em src/app/admin/layout.tsx
- [x] T012 Ajustar a entrada /admin para preservar login sem sessão e dashboard autenticado sob o novo layout em src/app/admin/page.tsx

**Checkpoint**: Tipos, validação, diálogo, navegação e proteção administrativa estão prontos para as histórias.

---

## Phase 3: User Story 1 - Cadastrar tenant (Priority: P1) MVP

**Goal**: Permitir que um administrador abra um formulário acessível e cadastre um tenant com nome e ID do Google Calendar.

**Independent Test**: Acessar `/admin/tenants`, abrir "Novo tenant", validar campos obrigatórios e concluir `POST /api/v1/tenants/` com payload normalizado, loading, bloqueio de duplicidade e mensagem de sucesso.

### Tests for User Story 1

- [x] T013 [P] [US1] Criar testes do contrato POST, payload exato, falhas de validação/rede e resposta incompatível em src/services/pythonBackend.tenants.test.ts
- [x] T014 [P] [US1] Criar testes do hook para cadastro, loading, prevenção de duplicidade, sucesso, erro por campo e descarte de resposta obsoleta em src/hooks/useTenantManagement.test.ts
- [x] T015 [P] [US1] Criar testes do formulário para abertura, labels, Cancelar, Escape, validação, loading, preservação em erro e anúncio de sucesso em src/components/admin/tenants/TenantForm.test.tsx
- [x] T016 [P] [US1] Criar testes da rota e composição para menu autorizado, proteção administrativa, título e ação "Novo tenant" em src/app/admin/tenants/page.test.tsx

### Implementation for User Story 1

- [x] T017 [US1] Implementar createTenant com POST /api/v1/tenants/, validação runtime e resultado discriminado em src/services/pythonBackend.ts
- [x] T018 [US1] Implementar estado e ação createTenant com AbortController e identificador monotônico em src/hooks/useTenantManagement.ts
- [x] T019 [US1] Implementar formulário reutilizável em modo create com React Hook Form, Zod, erros acessíveis e ações Cancelar/Cadastrar tenant em src/components/admin/tenants/TenantForm.tsx
- [x] T020 [US1] Implementar cabeçalho, região aria-live, abertura do formulário e estado inicial sem tabela fictícia em src/components/admin/tenants/TenantManagement.tsx
- [x] T021 [US1] Criar wrapper de servidor protegido com metadata específica e renderização de TenantManagement em src/app/admin/tenants/page.tsx
- [x] T022 [US1] Adicionar item Tenants com ícone Building2 e destino /admin/tenants à configuração em src/components/admin/AdminNavigation.tsx

**Checkpoint**: Cadastro é funcional e testável sem consulta, edição, exclusão ou listagem geral.

---

## Phase 4: User Story 2 - Consultar tenant por ID (Priority: P2)

**Goal**: Localizar exatamente um tenant por ID e apresentar seus dados sem chamar uma listagem inexistente.

**Independent Test**: Informar um ID conhecido, confirmar `GET /api/v1/tenants/{tenant_id}`, visualizar todos os campos retornados e receber "Tenant não encontrado" em 404.

### Tests for User Story 2

- [x] T023 [P] [US2] Adicionar testes do contrato GET por ID, codificação de path, 404, rede e proibição de GET /api/v1/tenants/ em src/services/pythonBackend.tenants.test.ts
- [x] T024 [P] [US2] Adicionar testes do hook para consulta, preservação do ID, loading, 404 e resposta obsoleta em src/hooks/useTenantManagement.test.ts
- [x] T025 [P] [US2] Criar testes de validação, loading e submissão da consulta em src/components/admin/tenants/TenantLookupForm.test.tsx
- [x] T026 [P] [US2] Criar testes da apresentação dos campos, datas, estado excluído e quebra responsiva de IDs em src/components/admin/tenants/TenantDetails.test.tsx

### Implementation for User Story 2

- [x] T027 [US2] Implementar getTenantById com GET codificado, validação runtime e mensagem específica de 404 em src/services/pythonBackend.ts
- [x] T028 [US2] Adicionar estado do tenant consultado e ação getTenantById com cancelamento e proteção contra resposta obsoleta em src/hooks/useTenantManagement.ts
- [x] T029 [P] [US2] Implementar formulário de consulta por ID com schema, loading e feedback acessível em src/components/admin/tenants/TenantLookupForm.tsx
- [x] T030 [P] [US2] Implementar detalhes semânticos do tenant, datas legíveis e bloqueio de ações para deleted_at preenchido em src/components/admin/tenants/TenantDetails.tsx
- [x] T031 [US2] Integrar consulta, estados vazio/não encontrado/erro e detalhes na página em src/components/admin/tenants/TenantManagement.tsx

**Checkpoint**: Consulta por ID funciona independentemente de edição e exclusão e nenhuma listagem é chamada.

---

## Phase 5: User Story 3 - Editar tenant consultado (Priority: P3)

**Goal**: Editar nome e ID do Google Calendar de um tenant ativo previamente consultado.

**Independent Test**: Consultar um tenant, abrir edição preenchida, concluir `PUT /api/v1/tenants/{tenant_id}` e confirmar dados atualizados e "Tenant atualizado com sucesso".

### Tests for User Story 3

- [x] T032 [P] [US3] Adicionar testes do contrato PUT, payload normalizado, 404, erros por campo e resposta incompatível em src/services/pythonBackend.tenants.test.ts
- [x] T033 [P] [US3] Adicionar testes do hook para atualização, duplicidade, sincronização do tenant e preservação de alterações em erro em src/hooks/useTenantManagement.test.ts
- [x] T034 [P] [US3] Adicionar testes do modo edit com valores iniciais, validação, Cancelar, loading e feedback em src/components/admin/tenants/TenantForm.test.tsx

### Implementation for User Story 3

- [x] T035 [US3] Implementar updateTenant com PUT /api/v1/tenants/{tenant_id}, payload restrito e resultado discriminado em src/services/pythonBackend.ts
- [x] T036 [US3] Adicionar ação updateTenant e sincronização segura do tenant consultado em src/hooks/useTenantManagement.ts
- [x] T037 [US3] Adicionar modo edit e ação "Salvar alterações" ao formulário compartilhado em src/components/admin/tenants/TenantForm.tsx
- [x] T038 [US3] Integrar abertura de edição, preservação em erro, fechamento em sucesso e anúncio "Tenant atualizado com sucesso" em src/components/admin/tenants/TenantManagement.tsx
- [x] T039 [US3] Disponibilizar ação Editar apenas para tenant ativo em src/components/admin/tenants/TenantDetails.tsx

**Checkpoint**: Edição funciona a partir de qualquer tenant ativo obtido por consulta.

---

## Phase 6: User Story 4 - Excluir tenant consultado (Priority: P4)

**Goal**: Excluir um tenant ativo somente após confirmação acessível que identifica o registro.

**Independent Test**: Consultar um tenant, abrir o diálogo "Excluir tenant?", conferir seu nome, cancelar sem efeito e depois confirmar `DELETE /api/v1/tenants/{tenant_id}` com feedback destrutivo e mensagem de sucesso.

### Tests for User Story 4

- [x] T040 [P] [US4] Adicionar testes do contrato DELETE para 204/com corpo, 404, rede e resposta inesperada em src/services/pythonBackend.tenants.test.ts
- [x] T041 [P] [US4] Adicionar testes do hook para exclusão, loading, duplicidade, limpeza do tenant e preservação em erro em src/hooks/useTenantManagement.test.ts
- [x] T042 [P] [US4] Criar testes do diálogo para nome, texto irreversível, estilo destrutivo, Cancelar, Escape, foco e loading em src/components/admin/tenants/TenantDeleteDialog.test.tsx

### Implementation for User Story 4

- [x] T043 [US4] Implementar deleteTenant com DELETE /api/v1/tenants/{tenant_id} aceitando sucesso 204 ou resposta válida sem depender de TenantResponse em src/services/pythonBackend.ts
- [x] T044 [US4] Adicionar ação deleteTenant, prevenção de duplicidade e limpeza segura do tenant consultado em src/hooks/useTenantManagement.ts
- [x] T045 [US4] Implementar confirmação acessível com nome do tenant e botão destrutivo em src/components/admin/tenants/TenantDeleteDialog.tsx
- [x] T046 [US4] Disponibilizar ação Excluir apenas para tenant ativo em src/components/admin/tenants/TenantDetails.tsx
- [x] T047 [US4] Integrar confirmação, preservação em erro e anúncio "Tenant excluído com sucesso" em src/components/admin/tenants/TenantManagement.tsx

**Checkpoint**: Cadastro, consulta, edição e exclusão estão funcionais e independentemente cobertos.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validar requisitos transversais e documentar pendências externas.

- [x] T048 [P] Adicionar testes de integração da navegação administrativa existente e do item Tenants em src/components/admin/AdminNavigation.test.tsx
- [x] T049 [P] Documentar ausência de GET /api/v1/tenants/, inconsistência de TenantResponse e semântica pendente do DELETE em specs/013-admin-tenant-management/quickstart.md
- [x] T050 Revisar componentes da feature para teclado, aria-live, foco, contraste não dependente de cor e ausência de overflow mobile em src/components/admin/tenants/
- [x] T051 Auditar src/services/pythonBackend.ts e src/hooks/useTenantManagement.ts para garantir ausência de logs com payloads, IDs ou respostas de tenant
- [x] T052 Executar testes focados da feature com Jest para src/services/pythonBackend.tenants.test.ts src/lib/tenantSchemas.test.ts src/hooks/useTenantManagement.test.ts src/components/admin/AdminDialog.test.tsx src/components/admin/AdminNavigation.test.tsx src/components/admin/tenants/ src/app/admin/tenants/page.test.tsx
- [x] T053 Executar npm run lint e npm run build e registrar resultados e limitações em specs/013-admin-tenant-management/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; começa imediatamente.
- **Foundational (Phase 2)**: depende do Setup e bloqueia todas as histórias.
- **US1 (Phase 3)**: depende da fundação e entrega o MVP.
- **US2 (Phase 4)**: depende da fundação; integra no mesmo shell da US1, mas serviço, hook e componentes de consulta são testáveis isoladamente.
- **US3 (Phase 5)**: depende da consulta da US2 para o fluxo de interface; contrato e ação de atualização podem ser desenvolvidos após a fundação.
- **US4 (Phase 6)**: depende da consulta da US2 para o fluxo de interface; contrato e ação de exclusão podem ser desenvolvidos após a fundação.
- **Polish (Phase 7)**: depende de todas as histórias incluídas na entrega.

### User Story Completion Order

```text
Setup -> Foundational -> US1 (MVP)
                       -> US2 -> US3
                              -> US4
US1 + US2 + US3 + US4 -> Polish
```

- **US1** não depende de outra história e pode ser demonstrada como MVP.
- **US2** não depende do cadastro; um ID já existente permite seu teste independente.
- **US3** usa o resultado da US2 na interface, mas pode ser testada com tenant consultado mockado.
- **US4** usa o resultado da US2 na interface, mas pode ser testada com tenant consultado mockado e independe da US3.

### Within Each User Story

- Escrever os testes da história e confirmar que falham antes da implementação.
- Implementar contrato do serviço antes da ação correspondente no hook.
- Implementar hook antes de integrar componentes na página.
- Manter componentes visuais livres de chamadas HTTP.
- Concluir o checkpoint e executar testes focados antes da próxima prioridade.

### Parallel Opportunities

- T004/T005, T007/T008 e T009/T010 atuam em pares de arquivos distintos durante a fundação.
- Os testes T013-T016 da US1 podem ser escritos em paralelo.
- Os testes e componentes novos T023-T026, T029 e T030 da US2 podem ser divididos por arquivo.
- US3 e US4 podem avançar em paralelo depois que US2 disponibilizar o tenant consultado.
- T048 e T049 são independentes entre si e das revisões de código do Polish.

## Parallel Example: User Story 1

```text
Task T013: Criar testes do POST em src/services/pythonBackend.tenants.test.ts
Task T014: Criar testes de cadastro em src/hooks/useTenantManagement.test.ts
Task T015: Criar testes do formulário em src/components/admin/tenants/TenantForm.test.tsx
Task T016: Criar testes da rota em src/app/admin/tenants/page.test.tsx
```

## Parallel Example: User Story 2

```text
Task T025: Criar testes de src/components/admin/tenants/TenantLookupForm.test.tsx
Task T026: Criar testes de src/components/admin/tenants/TenantDetails.test.tsx
Task T029: Implementar src/components/admin/tenants/TenantLookupForm.tsx
Task T030: Implementar src/components/admin/tenants/TenantDetails.tsx
```

## Parallel Example: User Stories 3 and 4

```text
Developer A: T032-T039 para edição de tenant
Developer B: T040-T047 para exclusão de tenant
```

## Implementation Strategy

### MVP First

1. Concluir Setup e Foundational.
2. Implementar T013-T022 da US1.
3. Executar as suites focadas de serviço, hook, formulário e rota.
4. Demonstrar cadastro válido, validação, loading, prevenção de duplicidade e erro.
5. Não bloquear o MVP pela ausência de listagem geral.

### Incremental Delivery

1. **MVP**: navegação protegida + cadastro de tenant.
2. **Incremento 2**: consulta por ID e detalhes.
3. **Incremento 3**: edição do tenant consultado.
4. **Incremento 4**: exclusão confirmada do tenant consultado.
5. **Finalização**: auditoria transversal, testes, lint, build e documentação de pendências do backend.

## Notes

- Tarefas com `[P]` alteram arquivos diferentes ou são testes independentes no momento indicado.
- Nenhuma tarefa deve criar ou chamar `GET /api/v1/tenants/`.
- Não adicionar nova biblioteca de modal ou toast; os padrões acessíveis podem ser implementados com APIs nativas e componentes locais.
- Não registrar nome, Google Calendar ID, tenant ID ou resposta de tenant em logs.
- O plano técnico está incompleto; se `/speckit.plan` for retomado e alterar contratos ou caminhos, revisar esta lista antes de `/speckit.implement`.
