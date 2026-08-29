# Feature Specification: Placeholders obrigatórios por tipo de prompt + validação ao salvar

**Feature Branch**: `026-prompt-type-placeholders`
**Created**: 2026-08-29
**Status**: Draft
**Input**: Na tela de criação/edição de prompt (operational, institutional, chitchat), exibir somente os placeholders obrigatórios do tipo selecionado; ao salvar, validar se os placeholders obrigatórios estão presentes no conteúdo e, se não estiverem, alertar o administrador deixando-o decidir entre "salvar mesmo assim" ou corrigir; ao trocar o tipo no dropdown "Nó de Destino", a dica de placeholders e os guardrails atribuídos devem atualizar (refresh) na tela.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validar placeholders obrigatórios ao salvar (Priority: P1)

O administrador cria ou edita um prompt de qualquer tipo (operational, institutional ou chitchat) e clica em salvar. O sistema verifica se o conteúdo contém todos os placeholders obrigatórios do tipo selecionado. Se algum estiver ausente, o sistema interrompe o salvamento, alerta quais placeholders faltam e oferece duas opções: corrigir (voltar ao formulário com tudo intacto) ou salvar mesmo assim.

**Why this priority**: é o comportamento que elimina a causa raiz do incidente de produção (prompt sem `{contexto_formatado}` que descartava o RAG em silêncio). A dica estática existente (EDI-50) informa, mas não impede; a validação no ato de salvar é a garantia de que o administrador tomou uma decisão consciente.

**Independent Test**: abrir o formulário de novo prompt, selecionar "Chitchat", digitar um conteúdo sem `{guardrails}` e salvar — o alerta aparece listando `{guardrails}`; escolher "Corrigir" mantém o formulário aberto e o texto intacto; repetir e escolher "Salvar mesmo assim" conclui o salvamento.

**Acceptance Scenarios**:

1. **Given** o formulário de prompt com "Nó de Destino" = Chitchat e conteúdo sem `{guardrails}`, **When** o administrador clica em salvar, **Then** o sistema exibe um alerta indicando que `{guardrails}` é obrigatório e está ausente, e não conclui o salvamento automaticamente.
2. **Given** o alerta de placeholders ausentes aberto, **When** o administrador escolhe "Corrigir", **Then** o alerta fecha, o formulário permanece aberto com título, conteúdo, tipo e guardrails selecionados intactos, permitindo editar o texto.
3. **Given** o alerta de placeholders ausentes aberto, **When** o administrador escolhe "Salvar mesmo assim", **Then** o sistema prossegue com o salvamento normalmente (mesmo fluxo de hoje, com sucesso/erro vindos da API).
4. **Given** um prompt institutional com `{guardrails}`, `{historico_texto}`, `{contexto_formatado}` e `{pergunta_usuario}` no conteúdo, **When** o administrador salva, **Then** nenhum alerta é exibido e o salvamento segue direto.
5. **Given** um prompt operational em edição com todos os 6 placeholders presentes, **When** o administrador salva, **Then** nenhum alerta é exibido.

---

### User Story 2 - Exibir somente os placeholders obrigatórios do tipo (Priority: P1)

Ao abrir o formulário de criação ou edição de prompt, a seção de ajuda exibe somente os placeholders obrigatórios para o `node_type` do prompt — nada além disso. Para chitchat, por exemplo, somente `{guardrails}` aparece; `{contexto_formatado}` e `{historico_texto}` não são mostrados nem sugeridos.

**Why this priority**: mantém a tela limpa e sem indução a erro — cada tipo tem um conjunto específico de placeholders que o motor de renderização usa de fato; exibir outros polui o prompt e confunde o administrador.

**Independent Test**: abrir o formulário de novo prompt e alternar o "Nó de Destino" entre os 3 tipos, conferindo que a lista exibida corresponde exatamente à lista obrigatória de cada tipo (operational: 6; institutional: 4; chitchat: 1).

**Acceptance Scenarios**:

1. **Given** o formulário de prompt aberto com "Nó de Destino" = Operacional, **When** o administrador olha a seção de ajuda, **Then** vê exatamente `{tenant_id}`, `{guardrails}`, `{tabela_calendario_str}`, `{hora_atual_str}`, `{data_hoje_iso}` e `{contexto_formatado}` — todos marcados como obrigatórios, e nenhum outro placeholder.
2. **Given** o formulário de prompt aberto com "Nó de Destino" = Institucional, **When** o administrador olha a seção de ajuda, **Then** vê exatamente `{guardrails}`, `{historico_texto}`, `{contexto_formatado}` e `{pergunta_usuario}` — todos marcados como obrigatórios, e nenhum outro placeholder.
3. **Given** o formulário de prompt aberto com "Nó de Destino" = Chitchat, **When** o administrador olha a seção de ajuda, **Then** vê somente `{guardrails}` — sem qualquer menção a `{contexto_formatado}`, `{historico_texto}` ou `{pergunta_usuario}`.
4. **Given** um prompt existente do tipo Chitchat aberto em modo de edição, **When** o formulário carrega, **Then** a seção de ajuda já reflete o tipo Chitchat (somente `{guardrails}`), sem ação extra do administrador.

---

### User Story 3 - Refresh da tela ao trocar o tipo no dropdown (Priority: P2)

No formulário de criação ou edição, quando o administrador troca o "Nó de Destino" entre os 3 tipos, a seção de dica de placeholders e a seção de guardrails são atualizadas imediatamente para refletir o novo tipo, sem fechar/reabrir o formulário nem recarregar a página.

**Why this priority**: evita que a tela mostre informação desatualizada (placeholders do tipo anterior) após a troca, que é exatamente a situação que leva a prompts mal formados.

**Independent Test**: abrir o formulário, selecionar "Operacional" (ver os 6 placeholders), trocar para "Institucional" e conferir que a lista e o exemplo mudam instantaneamente para os 4 placeholders; repetir para "Chitchat".

**Acceptance Scenarios**:

1. **Given** o formulário de prompt aberto com "Nó de Destino" = Operacional, **When** o administrador troca para "Institucional" no dropdown, **Then** a seção de dica de placeholders passa a exibir a lista e o exemplo do tipo institucional imediatamente.
2. **Given** o formulário de prompt aberto, **When** o administrador troca o "Nó de Destino" para qualquer um dos 3 tipos, **Then** a seção de guardrails é atualizada para refletir o novo tipo: os guardrails vinculados a ele aparecem marcados como selecionados, os não vinculados aparecem desmarcados, e os guardrails globais (aplicáveis a todos os nós) aparecem sempre na lista, sem recarregar a página.
3. **Given** trocas repetidas e rápidas entre os 3 tipos antes de salvar, **When** cada troca acontece, **Then** a tela sempre reflete o tipo selecionado no momento (a última troca prevalece), sem estado misturado.

---

### User Story 4 - Validar placeholders na customização de conteúdo do vínculo de tenant (Priority: P2)

Na tela "Vincular Tenant", quando o administrador preenche a "Customização de Conteúdo" de um vínculo e salva, o sistema verifica se o texto contém todos os placeholders obrigatórios do nó selecionado nas abas (Operacional/Institucional/Chitchat). Se algum faltar, o sistema alerta quais faltam e o administrador decide entre corrigir ou salvar o vínculo mesmo assim.

**Why this priority**: o override substitui o conteúdo efetivo do prompt para aquele tenant — é a mesma causa raiz do incidente do tenant 1234, por isso entra no mesmo escopo da feature.

**Independent Test**: na tela "Vincular Tenant", buscar um tenant, preencher a customização com um texto sem `{guardrails}` para o nó Chitchat e salvar — o alerta lista `{guardrails}`; escolher "Corrigir" mantém o formulário intacto; repetir e escolher "Salvar mesmo assim" conclui o vínculo.

**Acceptance Scenarios**:

1. **Given** a tela "Vincular Tenant" com a aba "Chitchat" ativa e um texto de customização sem `{guardrails}`, **When** o administrador clica em "Vincular Tenant", **Then** o sistema exibe o alerta de placeholders ausentes e não conclui o vínculo automaticamente.
2. **Given** o alerta de customização aberto, **When** o administrador escolhe "Corrigir", **Then** o alerta fecha e o formulário permanece com tenant, prompt selecionado e texto de customização intactos.
3. **Given** o alerta de customização aberto, **When** o administrador escolhe "Salvar mesmo assim", **Then** o vínculo é salvo normalmente (mesmo fluxo de sucesso/erro de hoje).
4. **Given** a aba "Operacional" ativa e uma customização contendo os 6 placeholders obrigatórios do tipo operacional, **When** o administrador salva o vínculo, **Then** nenhum alerta é exibido.
5. **Given** a aba "Institucional" ativa e uma customização com os 4 placeholders obrigatórios, **When** o administrador salva o vínculo, **Then** nenhum alerta é exibido.
6. **Given** o campo de customização vazio (vínculo usando o conteúdo base do prompt), **When** o administrador salva, **Then** nenhuma validação de placeholders é aplicada.

---

### Edge Cases

- Conteúdo vazio ao salvar: todos os placeholders obrigatórios estão ausentes — o alerta lista todos e segue o mesmo fluxo (corrigir ou salvar mesmo assim).
- Placeholder escrito com variação (ex.: `{Guardrails}`, `{ guardrails }`, `guardrails` sem chaves): não conta como presente — a validação é literal e sensível a maiúsculas/chaves.
- Placeholder repetido várias vezes no texto: conta como presente (basta existir ao menos uma ocorrência).
- Administrador troca o "Nó de Destino" após digitar o conteúdo: a validação ao salvar usa o tipo selecionado naquele momento e o conteúdo atual — nunca valores anteriores.
- Prompt legado (criado antes desta feature) sem todos os placeholders obrigatórios: ao editar e salvar, o alerta aparece — o administrador pode corrigir ou salvar mesmo assim.
- Prompt padrão (`is_default`) sem placeholders obrigatórios: mesmo fluxo de alerta — sem tratamento especial.
- Falha de rede ao salvar após "Salvar mesmo assim": comportamento idêntico ao salvamento normal (erro da API exibido como hoje), sem novo alerta de placeholders.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A seção de ajuda de placeholders MUST exibir somente os placeholders marcados como obrigatórios para o `node_type` selecionado no momento, filtrando qualquer placeholder não obrigatório.
- **FR-002**: Para `node_type = operational`, os placeholders obrigatórios são exatamente: `{tenant_id}`, `{guardrails}`, `{tabela_calendario_str}`, `{hora_atual_str}`, `{data_hoje_iso}`, `{contexto_formatado}` — e MUST NOT incluir `{pergunta_usuario}` nem `{historico_texto}`.
- **FR-003**: Para `node_type = institutional`, os placeholders obrigatórios são exatamente: `{guardrails}`, `{historico_texto}`, `{contexto_formatado}`, `{pergunta_usuario}`.
- **FR-004**: Para `node_type = chitchat`, o único placeholder obrigatório é `{guardrails}` — e MUST NOT exibir `{contexto_formatado}`, `{historico_texto}` ou `{pergunta_usuario}`.
- **FR-005**: Ao salvar um prompt (criação ou edição), o sistema MUST verificar se o conteúdo contém todos os placeholders obrigatórios do `node_type` selecionado no momento do salvamento.
- **FR-006**: A verificação MUST ser literal: o texto `{token}` (com chaves, na mesma grafia) deve aparecer ao menos uma vez no conteúdo para contar como presente.
- **FR-007**: Se um ou mais placeholders obrigatórios estiverem ausentes, o sistema MUST interromper o salvamento e exibir um alerta listando exatamente quais placeholders faltam, com duas ações: corrigir (voltar ao formulário) e salvar mesmo assim (prosseguir).
- **FR-008**: Ao escolher "corrigir", o alerta MUST fechar e o formulário MUST permanecer aberto com todos os campos preenchidos intactos (título, conteúdo, `is_default`, `node_type` e guardrails selecionados).
- **FR-009**: Ao escolher "salvar mesmo assim", o sistema MUST prosseguir com o salvamento exatamente como o fluxo normal (mesma chamada, mesmos estados de sucesso/erro).
- **FR-010**: A validação MUST usar o conteúdo e o `node_type` atuais no instante do clique em salvar — nunca valores desatualizados de trocas anteriores.
- **FR-011**: Ao trocar o valor do dropdown "Nó de Destino", a seção de dica de placeholders MUST atualizar imediatamente (lista e exemplo) para o novo tipo, sem exigir fechar/reabrir o formulário.
- **FR-012**: Ao trocar o valor do dropdown "Nó de Destino", a seção de guardrails MUST atualizar imediatamente para o novo tipo: os guardrails vinculados ao tipo selecionado MUST aparecer como selecionados, os não vinculados MUST aparecer como não selecionados, e os guardrails globais (`is_global`) MUST permanecer sempre visíveis na lista, pois se aplicam a todos os nós — sem exigir recarregar a página.
- **FR-013**: O comportamento MUST ser idêntico nos modos criação e edição de prompt.
- **FR-014**: A validação ao salvar MUST NOT bloquear além do alerta — trata-se de aviso com decisão do administrador, sem regra impeditiva no backend nem alteração do fluxo de salvamento.
- **FR-015**: Ao salvar um vínculo de tenant com "Customização de Conteúdo" preenchida, o sistema MUST verificar se o texto contém todos os placeholders obrigatórios do `node_type` da aba selecionada no momento do salvamento, usando a mesma verificação literal de FR-006 e o mesmo alerta com as duas ações de FR-007.
- **FR-016**: Quando o campo "Customização de Conteúdo" estiver vazio, o sistema MUST NOT aplicar validação de placeholders ao vínculo (o tenant usa o conteúdo base do prompt, validado na própria tela de prompt).

### Key Entities

- **Definição de placeholders obrigatórios por node_type**: mapeamento entre cada `node_type` (`operational`, `institutional`, `chitchat`) e a lista exata de placeholders obrigatórios (token + descrição + exemplo). Fonte única usada tanto pela seção de ajuda quanto pela validação de salvamento, para nunca divergirem.
- **Prompt**: mantém `node_type`, `conteudo` e `guardrail_ids`; o conteúdo é o alvo da validação de placeholders ao salvar.
- **Alerta de validação (estado transitório)**: estado de tela não persistido que lista os placeholders ausentes e as duas ações (corrigir / salvar mesmo assim).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos salvamentos de prompt sem algum placeholder obrigatório exibem o alerta antes de concluir — nenhum salvamento "passa direto" com placeholder obrigatório ausente.
- **SC-002**: 100% das vezes que o formulário é aberto (criação ou edição), a seção de ajuda exibe exclusivamente os placeholders obrigatórios do tipo do prompt — nenhum placeholder de outro tipo aparece.
- **SC-003**: 100% das trocas de "Nó de Destino" atualizam a seção de dica imediatamente, sem recarregar a página ou reabrir o formulário.
- **SC-004**: Em 100% dos alertas exibidos, as duas ações (corrigir e salvar mesmo assim) completam seus respectivos fluxos sem perda dos dados já preenchidos.
- **SC-005**: Nenhum alerta é exibido quando todos os placeholders obrigatórios do tipo selecionado estão presentes no conteúdo.

## Assumptions

- A lista de placeholders obrigatórios por tipo permanece estática no frontend (mesma fonte de EDI-50), e é a fonte única para exibição e validação.
- A validação é literal (chaves exatas e grafia idêntica); variações de casing/espaçamento não são reconhecidas.
- A validação é apenas um aviso no frontend com decisão do administrador — não há bloqueio rígido no backend nem alteração de contrato de API nesta feature (validação rígida, se desejada, permanece nos tickets de backend EDI-51/EDI-52, fora de escopo).
- A validação aplica-se ao formulário de criação/edição de prompt (tela "Prompts Base") e também à "Customização de Conteúdo" da tela "Vincular Tenant" (confirmado com o usuário — faz parte deste escopo); customização vazia não é validada.
- **Extensão pós-implementação**: durante a implementação, identificou-se um terceiro ponto de entrada que cria conteúdo de prompt e não estava coberto — o rascunho de "criar novo prompt a partir de um modelo" no cadastro de **novo tenant** (`PromptSelectField`, sempre `node_type = operational`). Confirmado com o usuário que o escopo se estende a esse fluxo: aviso não bloqueante (lista todos os obrigatórios ausentes) durante a edição do rascunho + o mesmo alerta bloqueante (Corrigir/Salvar mesmo assim) ao clicar em "Cadastrar tenant". O check antigo, restrito a `{guardrails}` (`hasGuardrailsPlaceholder`/`promptContent.ts`), foi removido por ter sido substituído.
- O exemplo de texto bem formado continua sendo exibido junto da lista de obrigatórios, sem mudança no comportamento somente-leitura da seção.
- Prompts existentes que já estejam corretos não sofrem qualquer alteração de dados por esta feature.
