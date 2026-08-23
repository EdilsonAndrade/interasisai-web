# Feature Specification: Ajuda de placeholders obrigatórios ao cadastrar prompt

**Feature Branch**: `edilsonaandrade/edi-50-frontend-exibir-placeholders-obrigatorios-e-exemplo-ao`
**Created**: 2026-08-23
**Status**: Draft
**Ticket**: [EDI-50](https://linear.app/edilsonandrade/issue/EDI-50/frontend-exibir-placeholders-obrigatorios-e-exemplo-ao)

**Input**: Na tela de criação/edição de prompt (institutional, operational, chitchat), adicionar uma seção de ajuda abaixo do campo de conteúdo do prompt, específica por `node_type`, listando todos os placeholders aceitos, quais são obrigatórios e um exemplo de texto bem formado usando todos eles corretamente posicionados. Descoberto durante investigação de um bug real em produção (tenant 1234): um prompt institucional sem `{contexto_formatado}` fazia o motor de renderização descartar o contexto do RAG em silêncio, sem erro visível, porque a tela não avisava quais placeholders eram obrigatórios.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar placeholders obrigatórios e exemplo ao cadastrar prompt operational/institutional (Priority: P1)

O administrador está criando ou editando um prompt do tipo operacional ou institucional. Abaixo do campo de conteúdo (Markdown), ele vê a lista completa de placeholders aceitos para aquele tipo, todos marcados como obrigatórios, e um exemplo de texto completo mostrando o posicionamento correto de cada um.

**Why this priority**: é a causa raiz do incidente em produção — o prompt institucional do tenant 1234 foi cadastrado sem `{contexto_formatado}`, e o RAG foi descartado em silêncio. Cobrir operational e institutional primeiro elimina o maior risco.

**Independent Test**: abrir o formulário de novo prompt, selecionar "Operacional" e conferir que a lista mostra `{guardrails}`, `{tenant_id}`, `{contexto_formatado}`, `{tabela_calendario_str}`, `{hora_atual_str}`, `{data_hoje_iso}` como obrigatórios com exemplo; trocar para "Institucional" e conferir `{guardrails}`, `{historico_texto}`, `{contexto_formatado}`, `{pergunta_usuario}` como obrigatórios com exemplo.

**Acceptance Scenarios**:

1. **Given** o formulário de prompt aberto com "Nó de Destino" = Operacional, **When** o administrador olha abaixo do campo de conteúdo, **Then** vê a lista dos 6 placeholders do tipo operacional, todos indicados como obrigatórios, e um exemplo de texto usando todos eles.
2. **Given** o formulário de prompt aberto com "Nó de Destino" = Institucional, **When** o administrador olha abaixo do campo de conteúdo, **Then** vê a lista dos 4 placeholders do tipo institucional, todos indicados como obrigatórios, e um exemplo seguindo o modelo `--- CONVERSATION HISTORY --- / --- CONTEXT FROM KNOWLEDGE BASE --- / User Question:`.
3. **Given** o administrador troca o valor de "Nó de Destino" de Operacional para Institucional (ou vice-versa), **When** a troca acontece, **Then** a lista e o exemplo exibidos são atualizados imediatamente para o novo tipo, sem precisar fechar e reabrir o formulário.

---

### User Story 2 - Consultar placeholders ao cadastrar prompt chitchat sem sugerir campos inaplicáveis (Priority: P2)

O administrador está criando ou editando um prompt do tipo chitchat. Abaixo do campo de conteúdo, ele vê que o único placeholder aceito e obrigatório é `{guardrails}`, sem nenhuma menção a `{contexto_formatado}` ou `{historico_texto}` — que não se aplicam a esse nó.

**Why this priority**: risco menor que US1 (chitchat não carrega RAG nem contexto factual), mas evita confundir o administrador com placeholders que não fazem efeito nesse tipo de prompt.

**Independent Test**: abrir o formulário de novo prompt, selecionar "Chitchat" e conferir que a lista mostra somente `{guardrails}` como obrigatório, com um exemplo simples, e que `{contexto_formatado}`/`{historico_texto}` não aparecem em nenhum lugar da seção de ajuda.

**Acceptance Scenarios**:

1. **Given** o formulário de prompt aberto com "Nó de Destino" = Chitchat, **When** o administrador olha abaixo do campo de conteúdo, **Then** vê apenas `{guardrails}` listado como obrigatório e um exemplo de texto usando somente esse placeholder.
2. **Given** a seção de ajuda para o tipo Chitchat, **When** o administrador revisa a lista, **Then** não encontra `{contexto_formatado}` nem `{historico_texto}` mencionados como aplicáveis.

---

### Edge Cases

- O que acontece se o administrador não digitar nada no campo de conteúdo? A seção de ajuda é exibida normalmente de qualquer forma — ela é estática e não depende do texto já digitado.
- O que acontece se o administrador editar um prompt existente que já está com o conteúdo correto (usando todos os placeholders)? A seção de ajuda aparece do mesmo jeito, apenas como referência — ela não compara com o conteúdo atual nem indica quais placeholders já estão em uso (fora de escopo desta versão).
- O que acontece ao trocar repetidamente o "Nó de Destino" antes de salvar? A lista e o exemplo sempre refletem o tipo selecionado no momento, mesmo que o conteúdo já digitado não tenha mudado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir, abaixo do campo de conteúdo (Markdown) do formulário de criação/edição de prompt, uma seção de ajuda de placeholders específica para o `node_type` selecionado no momento.
- **FR-002**: Para `node_type = operational`, a seção MUST listar como obrigatórios: `{guardrails}`, `{tenant_id}`, `{contexto_formatado}`, `{tabela_calendario_str}`, `{hora_atual_str}`, `{data_hoje_iso}`.
- **FR-003**: Para `node_type = institutional`, a seção MUST listar como obrigatórios: `{guardrails}`, `{historico_texto}`, `{contexto_formatado}`, `{pergunta_usuario}`.
- **FR-004**: Para `node_type = chitchat`, a seção MUST listar como obrigatório apenas `{guardrails}`, e MUST NOT exibir `{contexto_formatado}` ou `{historico_texto}` como se fossem aplicáveis a esse tipo.
- **FR-005**: A seção MUST exibir, para o `node_type` selecionado, um exemplo de texto completo e bem formado usando todos os placeholders aplicáveis, corretamente posicionados (o exemplo do tipo institutional segue o modelo do fallback local `prompts/institutional_prompt.md`, com os blocos `--- CONVERSATION HISTORY ---`, `--- CONTEXT FROM KNOWLEDGE BASE ---` e `User Question:`).
- **FR-006**: A seção MUST atualizar a lista e o exemplo exibidos imediatamente quando o usuário altera o campo "Nó de Destino", sem exigir fechar/reabrir o formulário.
- **FR-007**: A seção MUST ser somente leitura — sem controle para inserir ou copiar o exemplo automaticamente no campo de conteúdo, e sem comparar/validar o texto já digitado contra a lista de placeholders.
- **FR-008**: A seção MUST ser exibida tanto no modo de criação quanto no modo de edição de prompt.
- **FR-009**: O sistema MUST NOT bloquear o envio do formulário nem exibir erro de validação por placeholder obrigatório ausente — esse comportamento pertence aos tickets EDI-51 (backend) e EDI-52 (frontend), fora do escopo aqui.

### Key Entities

- **Definição de placeholders por node_type**: mapeamento estático, mantido no código do frontend, entre cada `node_type` (`operational`, `institutional`, `chitchat`) e sua lista de placeholders aceitos, obrigatoriedade de cada um e um texto de exemplo bem formado. Não persistido no backend nem configurável pela interface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos administradores que abrem o formulário de criação/edição de prompt veem a lista de placeholders obrigatórios e o exemplo correspondente ao `node_type` selecionado, sem nenhuma ação extra.
- **SC-002**: Nenhum placeholder é exibido como aplicável a um `node_type` que não o utiliza (ex.: chitchat nunca mostra `{contexto_formatado}` ou `{historico_texto}`).
- **SC-003**: A troca do campo "Nó de Destino" atualiza a seção de ajuda exibida em 100% das vezes, sem exigir recarregar a tela ou reabrir o formulário.

## Assumptions

- Os placeholders e exemplos por `node_type` são estáticos no código do frontend, conforme confirmado no ticket a partir de `prompts/load_prompt.py`, `modules/ia/agent_graph.py` e os templates locais em `prompts/*.md`.
- Não há checagem automática entre o texto já digitado pelo administrador e a lista de placeholders obrigatórios nesta versão — a seção é puramente informativa e estática (decisão confirmada com o usuário em 2026-08-23).
- Não há botão de inserir/copiar o exemplo no editor — o texto de exemplo é apenas para consulta (decisão confirmada com o usuário em 2026-08-23).
- A seção é sempre visível (não colapsável/expandível) abaixo do editor de conteúdo, reforçando o alerta que motivou o ticket (decisão confirmada com o usuário em 2026-08-23).
- Validação/bloqueio de salvamento por placeholder obrigatório ausente fica para os tickets EDI-51 (backend) e EDI-52 (frontend), fora do escopo desta versão.
