# Feature Specification: Painel Admin — Prompts do Sistema (versionamento e rollback)

**Feature Branch**: `edilsonaandrade/edi-71-painel-admin-gerenciar-prompts-do-sistema-hardcoded-no`
**Created**: 2026-08-31
**Status**: Draft
**Input**: User description: "Painel Admin: gerenciar prompts do sistema (hardcoded no agent_graph) com versionamento e rollback (EDI-71)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Localizar e visualizar os prompts do sistema (Priority: P1)

Como administrador autenticado, quero acessar o submenu "Prompts do Sistema" dentro do menu "Painel" e visualizar a lista dos prompts hoje hardcoded no backend, cada um identificado pelo nome de origem, para saber quais prompts existem e podem ser administrados.

**Why this priority**: Sem a navegação e a listagem, nenhuma outra ação (editar, salvar, rollback) é possível. É a base de toda a feature.

**Independent Test**: Pode ser testado acessando o painel administrativo, abrindo o menu "Painel", clicando em "Prompts do Sistema" e conferindo que os 4 prompts aparecem listados com seus títulos de origem.

**Acceptance Scenarios**:

1. **Given** que um administrador autenticado está no painel administrativo, **When** ele abre o menu "Painel", **Then** vê os submenus "Prompts do Sistema" e "Ingestão Tenant".
2. **Given** que o administrador clica em "Ingestão Tenant", **When** a navegação ocorre, **Then** ele chega na tela atual de busca de tenant/base de conhecimento, sem nenhuma alteração de comportamento.
3. **Given** que o administrador clica em "Prompts do Sistema", **When** a tela carrega, **Then** os 4 prompts (routing_agent, GROUNDEDNESS_RULE, CHITCHAT_NO_KNOWLEDGE_RULE, BOOKING_INTEGRITY_RULE) são listados, cada um com seu título fixo de origem.
4. **Given** que a listagem está carregando, **When** a requisição está pendente, **Then** um indicador de carregamento é exibido.
5. **Given** que a requisição de listagem falha, **When** o erro é recebido, **Then** uma mensagem de erro é exibida e o administrador pode tentar novamente.

---

### User Story 2 - Editar e salvar o conteúdo de um prompt (Priority: P2)

Como administrador autenticado, quero editar o conteúdo de um prompt específico e salvar a alteração, para ajustar o comportamento da IA sem depender de deploy de código.

**Why this priority**: É o valor central da feature — deixar de editar código para editar pelo painel. Depende da listagem (P1) já estar disponível.

**Independent Test**: Pode ser testado abrindo um prompt da lista, alterando o texto do conteúdo, salvando, e conferindo que o novo conteúdo passa a ser o vigente e que a versão anterior fica disponível para rollback.

**Acceptance Scenarios**:

1. **Given** que o administrador abre um prompt da lista, **When** a tela de edição é exibida, **Then** o conteúdo atualmente vigente (versão corrente) é apresentado em um campo editável.
2. **Given** que o administrador altera o conteúdo e aciona "Salvar", **When** a alteração é confirmada, **Then** o novo conteúdo passa a ser a versão vigente, a versão anterior é preservada para rollback, e uma confirmação de sucesso é exibida.
3. **Given** que o administrador tenta salvar um conteúdo vazio ou apenas com espaços, **When** ele aciona "Salvar", **Then** o sistema bloqueia o envio e exibe uma mensagem indicando que o conteúdo é obrigatório.
4. **Given** que ocorre falha ao salvar (erro de rede ou do servidor), **When** o erro é recebido, **Then** o conteúdo digitado permanece no campo e uma mensagem de erro é exibida, sem perda do que foi digitado.
5. **Given** que uma operação de salvamento está em andamento, **When** o administrador tenta salvar novamente, **Then** o sistema impede o envio duplicado (ex.: botão desabilitado durante o carregamento).

---

### User Story 3 - Reverter um prompt para a versão anterior (Priority: P3)

Como administrador autenticado, quero reverter (rollback) um prompt para a versão anterior, para desfazer rapidamente uma alteração que se mostrou problemática, sem precisar redigitar o conteúdo antigo manualmente.

**Why this priority**: É o mecanismo de segurança da feature, mas só tem utilidade depois que ao menos uma edição (P2) ocorreu.

**Independent Test**: Pode ser testado editando um prompt (criando uma versão anterior), acionando "Reverter" e conferindo que o conteúdo exibido volta a ser o anterior; acionando "Reverter" novamente confirma que a operação é reversível (volta ao estado seguinte).

**Acceptance Scenarios**:

1. **Given** que um prompt possui uma versão anterior registrada, **When** o administrador aciona "Reverter para versão anterior", **Then** um pedido de confirmação é exibido antes da ação ser efetivada.
2. **Given** que o administrador confirma o rollback, **When** a operação é concluída, **Then** o conteúdo anterior passa a ser a versão vigente exibida na tela, e uma confirmação de sucesso é exibida.
3. **Given** que o administrador aciona "Reverter" duas vezes seguidas (confirmando ambas), **When** as duas operações são concluídas, **Then** o prompt retorna ao conteúdo que estava vigente antes da primeira reversão (operação reversível).
4. **Given** que ocorre falha ao reverter (erro de rede ou do servidor), **When** o erro é recebido, **Then** o conteúdo exibido não é alterado e uma mensagem de erro é exibida.

---

### Edge Cases

- O administrador acessa a tela "Prompts do Sistema" sem estar autenticado: deve ser redirecionado/bloqueado como nas demais telas administrativas.
- Um prompt_key inesperado (fora dos 4 valores conhecidos) é retornado pela listagem: a tela deve exibir o item de forma segura (usando a `titulo` recebida) sem quebrar a listagem dos demais.
- O administrador tenta acessar diretamente um prompt inexistente (chave inválida): deve ver uma mensagem de "não encontrado" e um caminho para voltar à listagem.
- O administrador alterna rapidamente entre prompts durante uma operação de salvar/reverter pendente: a resposta de uma operação anterior não deve sobrescrever o estado de um prompt diferente já selecionado.
- Conteúdo de prompt muito extenso (ex.: milhares de caracteres): o campo de edição deve permanecer utilizável (rolagem, sem travar a interface).

## Requirements *(mandatory)*

### Functional Requirements

**Acesso e Navegação**

- **FR-001**: O menu administrativo "Painel" DEVE exibir dois submenus: "Prompts do Sistema" e "Ingestão Tenant".
- **FR-002**: O submenu "Ingestão Tenant" DEVE levar à tela atualmente existente de busca de tenant/base de conhecimento, sem nenhuma alteração de comportamento, layout ou rota.
- **FR-003**: O submenu "Prompts do Sistema" DEVE levar a uma nova tela dedicada à listagem e administração dos prompts do sistema.
- **FR-004**: O acesso à tela "Prompts do Sistema" DEVE exigir sessão administrativa autenticada, seguindo o mesmo mecanismo de proteção já usado nas demais telas do painel administrativo.

**Listagem de Prompts**

- **FR-005**: A tela DEVE listar exatamente os prompts do sistema disponíveis, exibindo para cada um o título fixo indicando sua origem (ex.: "routing_agent", "GROUNDEDNESS_RULE", "CHITCHAT_NO_KNOWLEDGE_RULE", "BOOKING_INTEGRITY_RULE").
- **FR-006**: Enquanto a listagem está sendo carregada, a tela DEVE exibir um indicador de carregamento.
- **FR-007**: Se a listagem falhar ao carregar, a tela DEVE exibir uma mensagem de erro e permitir nova tentativa.

**Edição e Salvamento**

- **FR-008**: Ao selecionar um prompt, a tela DEVE exibir o conteúdo atualmente vigente (versão corrente) em um campo de texto editável.
- **FR-009**: O sistema DEVE permitir salvar um novo conteúdo para o prompt selecionado.
- **FR-010**: Ao salvar, o sistema DEVE validar que o conteúdo não está vazio nem contém apenas espaços em branco, bloqueando o envio e exibindo mensagem de erro caso esteja.
- **FR-011**: Após salvar com sucesso, a versão anterior do prompt DEVE ser preservada de forma recuperável (disponível para reversão), e o novo conteúdo passa a ser a versão vigente exibida.
- **FR-012**: O sistema DEVE impedir o envio de múltiplas operações de salvamento simultâneas para o mesmo prompt (ex.: desabilitando a ação enquanto uma operação está pendente).
- **FR-013**: Em caso de falha ao salvar, o conteúdo editado pelo administrador DEVE ser preservado na tela (não perdido) e uma mensagem de erro DEVE ser exibida.

**Reversão (Rollback)**

- **FR-014**: O sistema DEVE permitir reverter um prompt para a versão anteriormente registrada.
- **FR-015**: A ação de reverter DEVE exigir confirmação explícita do administrador antes de ser efetivada.
- **FR-016**: A operação de reversão DEVE ser reversível: aplicá-la duas vezes seguidas deve retornar o prompt ao conteúdo vigente anterior à primeira reversão.
- **FR-017**: Após reverter com sucesso, o conteúdo exibido na tela DEVE refletir imediatamente a versão restaurada.
- **FR-018**: Em caso de falha ao reverter, o conteúdo exibido NÃO DEVE ser alterado e uma mensagem de erro DEVE ser exibida.

**Feedback e Robustez**

- **FR-019**: Toda operação de salvar ou reverter concluída com sucesso DEVE exibir uma notificação de sucesso com mensagem específica da ação realizada.
- **FR-020**: Toda falha de operação (erro do servidor ou de rede) DEVE exibir uma notificação de erro compreensível ao administrador.
- **FR-021**: O sistema NÃO DEVE registrar em log o conteúdo textual dos prompts (apenas identificadores/metadados de operação).

**Fora de Escopo**

- Esta feature NÃO altera o comportamento, layout ou rota da tela "Ingestão Tenant".
- Esta feature NÃO remove os prompts hardcoded usados como fallback no backend; eles continuam existindo como reserva até uma migração completa futura.
- Esta feature NÃO inclui criação ou exclusão de prompts — apenas edição e reversão dos prompts do sistema já existentes.

### Key Entities

- **Prompt do Sistema**: Representa um prompt administrável do agente de IA. Atributos: identificador de origem (chave fixa), título de exibição (indica de qual parte do sistema de IA ele vem), conteúdo vigente (versão corrente) e conteúdo da versão anterior (disponível para reversão). É um conjunto fixo e pré-definido de itens — não é criado nem excluído por este painel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador consegue localizar e abrir a tela "Prompts do Sistema" a partir do menu "Painel" em até 2 cliques.
- **SC-002**: Um administrador consegue editar e salvar o conteúdo de um prompt em até 1 minuto, do momento em que abre o prompt até a confirmação de sucesso.
- **SC-003**: Um administrador consegue reverter um prompt para a versão anterior em até 30 segundos, incluindo a etapa de confirmação.
- **SC-004**: 100% das operações de salvar e reverter exibem feedback claro de sucesso ou erro — nenhuma operação ocorre silenciosamente.
- **SC-005**: A navegação para a tela "Ingestão Tenant" continua funcionando exatamente como antes, sem nenhuma regressão perceptível ao usuário.
- **SC-006**: Uma reversão aplicada duas vezes seguidas restaura o conteúdo original, comprovando que a operação nunca resulta em perda permanente do conteúdo anterior.

## Assumptions

- O backend já expõe os endpoints necessários para listar, consultar, atualizar e reverter os prompts do sistema (conforme documentado no ticket EDI-71), incluindo a migração inicial que popula tanto a versão vigente quanto a versão anterior com o conteúdo hoje hardcoded — não havendo, portanto, cenário de reversão para conteúdo nulo.
- O conjunto de prompts administráveis é fixo (os 4 hoje hardcoded no agente); não há necessidade de suportar criação de novos itens nesta entrega.
- A autenticação e autorização administrativa já existentes no painel serão reutilizadas, sem necessidade de um novo mecanismo de permissão.
- O sistema de notificações (toast) já disponível nas demais telas administrativas será reutilizado para exibir sucesso/erro.
- Esta tela é uma feature distinta da já existente "Prompts & Guardrails" (gerenciamento N:N de prompts/guardrails por tenant); ambas coexistem sem sobreposição de rota ou dados.
- O idioma da interface é Português (Brasil), consistente com o restante do painel administrativo.
