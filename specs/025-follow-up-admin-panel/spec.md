# Feature Specification: Follow-up Admin Panel

**Feature Branch**: `025-follow-up-admin-panel`  
**Created**: 2026-08-26  
**Status**: Draft  
**Input**: EDI-65 — UI: Painel de follow-up (revisão, aprovação e histórico)

## User Scenarios & Testing

### User Story 1 - Revisar e aprovar rascunhos de follow-up (Priority: P1)

Um membro da equipe (admin/CS/Vendas) acessa o painel, visualiza a fila de rascunhos de follow-up gerados automaticamente pelo sistema backend, e aprova ou edita mensagens antes que sejam enviadas ao cliente. Isso garante que nenhuma comunicação sai sem revisão humana.

**Why this priority**: É a funcionalidade central — reduz risco de envios automáticos inadequados e empodera o time a personalizar mensagens mantendo guardrails comerciais.

**Independent Test**: Pode ser testado isoladamente: logando como admin, navegando para a fila, vendo rascunhos pendentes, editando um texto, e aprovando. A feature entrega valor mesmo sem as outras seções.

**Acceptance Scenarios**:

1. **Given** fila com rascunhos pendentes, **When** usuário admin clica "Visualizar fila", **Then** listagem mostra todos os pendentes com filtros opcionais (status, outcome, tenant)
2. **Given** rascunho na fila, **When** usuário clica "Editar", **Then** modal abre com texto editável do draft_message
3. **Given** rascunho editado, **When** usuário tenta adicionar "desconto de 50%" e esse desconto não está em oferta_vigente, **Then** alerta avisa "Esta condição não está configurada para este tenant"
4. **Given** rascunho revisado, **When** usuário clica "Aprovar", **Then** status muda para "aprovado" e registro é salvo com timestamp de aprovação
5. **Given** rascunho que não será enviado, **When** usuário clica "Descartar", **Then** status muda para "descartado" e não aparece mais na listagem de pendentes
6. **Given** cliente que não quer mais receber follow-ups, **When** usuário marca como "opt_out", **Then** registro fica marcado e não será enviado/reprocessado

---

### User Story 2 - Consultar histórico de conversa (Priority: P2)

Um membro do suporte precisa entender o contexto completo de uma conversa com um cliente antes de responder a uma nova dúvida. Acessa o painel, busca por tenant ou thread_id, e visualiza a sequência de mensagens trocadas.

**Why this priority**: Suporte eficiente requer context; sem isto, duplicam perguntas e perdem contexto de tentativas anteriores.

**Independent Test**: Pode ser testado isoladamente: selecionando um tenant, visualizando threads, clicando em uma thread, e vendo o histórico renderizado. Não depende de aprovação de follow-ups.

**Acceptance Scenarios**:

1. **Given** painel aberto, **When** usuário navega para aba "Histórico" e busca por tenant_id, **Then** lista de threads aparece com resumo (outcome, data, número de mensagens)
2. **Given** thread selecionada, **When** histórico carrega, **Then** mostra cronologia com role (user/assistant), conteúdo, timestamp de cada mensagem
3. **Given** histórico com muitas mensagens, **When** usuário faz scroll, **Then** carrega mais mensagens (lazy-load) ou disponibiliza paginação
4. **Given** mensagem com markdown/links, **When** renderizada no histórico, **Then** exibe corretamente (não cru, não HTML-escapado incorretamente)

---

### User Story 3 - Configurar oferta vigente por tenant (Priority: P3)

Um admin precisa manter as ofertas de cada tenant atualizadas para que os drafts de follow-up nunca mencionem condições comerciais expiradas. Acessa painel de configuração, seleciona tenant, atualiza oferta_vigente (texto) e data de validade.

**Why this priority**: Garante guardrail comercial; sem isso, drafts podem citar descontos/condições que não existem mais.

**Independent Test**: Pode ser testado isoladamente: indo para config, editando oferta_vigente de um tenant, salvando, e verificando que o valor foi persistido.

**Acceptance Scenarios**:

1. **Given** painel de configuração aberto, **When** usuário seleciona um tenant, **Then** campos oferta_vigente (texto) e retention_days aparecem pré-preenchidos com valores atuais
2. **Given** campo de texto vazio, **When** usuário digita nova oferta "Desconto de 10% + frete grátis até 31/12/2026", **Then** texto é aceito
3. **Given** data de validade em campo, **When** usuário edita para data futura, **Then** campo valida (não deixa datas no passado)
4. **Given** alteração feita, **When** usuário clica "Salvar", **Then** PATCH é enviado para /tenants/:tenantId, e feedback visual confirma sucesso

---

### User Story 4 - Dashboard resumido com KPIs (Priority: P4)

Um gerente acessa o painel e visualiza status geral: quantos follow-ups estão pendentes, distribuição por outcome, quais tenants têm ofertas expiradas, e últimas sessões geradas.

**Why this priority**: Visibilidade operacional; complementa as outras features mas é nice-to-have para MVP.

**Independent Test**: Pode ser testado isoladamente: verificando que cards de KPI renderizam, números estão corretos, e filtros funcionam.

**Acceptance Scenarios**:

1. **Given** painel carregado, **When** dashboard renderiza, **Then** exibe cards com: total pendentes, breakdown por outcome, tenants com oferta expirada
2. **Given** dados atualizados no backend, **When** usuário faz refresh, **Then** números refletem estado corrente
3. **Given** muitos tenants, **When** usuário filtra por tenant na dashboard, **Then** cards atualizam para mostrar apenas dados desse tenant

---

### Edge Cases

- **Rascunho com conteúdo muito longo**: Como renderizar draft_message que ultrapassa limite de caracteres? → Mostrar com scroll interno ou resumo com "ver mais".
- **Tenant sem oferta_vigente definida**: Como validar client-side se não há oferta? → Permitir qualquer oferta nesse caso (aviso soft).
- **Histórico vazio**: Thread sem mensagens. → Mostrar mensagem "Nenhuma conversa registrada".
- **Usuário sem permissão admin**: Como bloquear acesso? → Rota protegida; não renderizar painel se não for admin.
- **Timeout ao carregar histórico grande**: Histórico com 1000+ mensagens. → Implementar paginação/lazy-load para não travar UI.
- **Edição simultânea**: Dois admins editam mesmo rascunho ao mesmo tempo. → Last-write-wins (ou implementar otimistic locking no backend).

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE exibir fila de follow-up com listagem de rascunhos pendentes, aprovados, enviados, descartados e opt_out
- **FR-002**: Usuário admin DEVE poder editar texto de rascunho em modal antes de aprovar
- **FR-003**: Sistema DEVE validar client-side: se texto contém desconto/condição, verificar se está em oferta_vigente do tenant
- **FR-004**: Usuário admin DEVE poder aprovar (status → aprovado), descartar (status → descartado) ou marcar opt_out (status → opt_out)
- **FR-005**: Sistema DEVE permitir filtrar fila por status, outcome e tenant_id
- **FR-006**: Sistema DEVE exibir histórico de conversa por tenant/thread com cronologia completa (role, conteúdo, timestamp)
- **FR-007**: Usuário admin DEVE poder editar e salvar oferta_vigente (texto + data de validade) e retention_days por tenant
- **FR-008**: Sistema DEVE renderizar markdown e links corretamente no histórico de conversa
- **FR-009**: Sistema DEVE implementar lazy-load ou paginação para históricos com muitas mensagens
- **FR-010**: Acesso à feature DEVE ser restrito a usuários com role admin
- **FR-011**: Sistema DEVE exibir dashboard resumido com KPIs: totais pendentes, breakdown por outcome, tenants com oferta expirada (opcional MVP)
- **FR-012**: UI DEVE ser responsiva e funcionar em desktop e tablet

### Key Entities

- **Follow-up Queue Entry**: Representa um rascunho aguardando aprovação; contém tenant_id, base_thread_id, outcome, summary, draft_message, status, attempts, created_at, approved_by, approved_at
- **Conversation Message**: Registro de uma mensagem trocada; contém tenant_id, base_thread_id, active_thread_id, role (user/assistant), content, created_at
- **Tenant Configuration**: Dados de configuração por tenant; contém oferta_vigente (texto + validade) e retention_days
- **User/Admin**: Pessoa acessando o painel; possui role que define permissões (admin, cs, vendas, etc.)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin consegue visualizar fila completa e filtrada em menos de 2 segundos após carregar painel
- **SC-002**: 100% dos rascunhos editados antes de aprovação têm validação client-side executada (nenhum desconto não-autorizado passa)
- **SC-003**: Histórico de conversa com até 500 mensagens carrega e renderiza em menos de 3 segundos
- **SC-004**: Admin consegue completar fluxo (visualizar → editar → aprovar) em menos de 1 minuto por rascunho
- **SC-005**: Taxa de acesso não-autorizado é 0% (permissões funcionam, usuários não-admin não conseguem acessar)
- **SC-006**: Todas as telas funcionam em viewport mobile (320px) e desktop (1920px) sem quebras de layout

## Assumptions

- Backend (EDI-53) está completo com endpoints: GET /follow-up-queue, PATCH /follow-up-queue/:queueId, GET /conversation-history/:tenantId/:baseThreadId, GET/PATCH /tenants/:tenantId
- Autenticação e sistema de roles/permissions já existem no projeto
- Design system (componentes UI) já existe ou será reutilizado do projeto existente
- Histórico de conversas é armazenado em tabela `conversation_messages` com estrutura definida em EDI-53
- Fila de follow-up é armazenada em tabela `follow_up_queue` conforme EDI-53
- Campo `oferta_vigente` em tabela `tenants` é texto (markdown/HTML) + timestamp de validade
- Markdown é renderizado no histórico (não exibido cru)
- Usuários têm role/permission system já em lugar (não será criado para esta feature)
- Envio automático de follow-ups (worker/cron) é out-of-scope (EDI-53)
