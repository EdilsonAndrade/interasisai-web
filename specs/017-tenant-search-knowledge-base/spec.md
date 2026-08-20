# Feature Specification: Busca de Tenant e Gestão da Base de Conhecimento

**Feature Branch**: `017-tenant-search-knowledge-base`
**Created**: 2026-08-19
**Status**: Draft
**Input**: User description: "Dado que eu tenho acesso ao PAINEL Administrador ao fazer login entrando na tela de Painel Administrador - Adicionar Novo Tenant - permitir busca de tenant para mostrar os prompts relacionads e guadrails - permitir editar ou excluir a base de conhecimento para incluir uma nova (ja enviei a mesma mensagem para o backend)"

## Resumo Funcional

A tela "Painel Administrador - Adicionar Novo Tenant" (`/admin`, componente `AdminDashboard`) hoje permite apenas adicionar texto à base de conhecimento de um tenant, sem busca, visualização, edição ou exclusão. Esta feature adiciona: (1) uma busca por termo (nome ou ID) que retorna tenants correspondentes e, ao selecionar um, exibe o prompt vinculado (ou o prompt padrão, quando não houver vínculo customizado) e os guardrails associados, para dar contexto antes de qualquer alteração; e (2) a gestão da base de conhecimento do tenant selecionado — visualizar o conteúdo atual, criá-lo, editá-lo ou excluí-lo através de um único fluxo de upsert.

Esta especificação foi atualizada após o recebimento do contrato de API definido pela equipe de backend (ver [contracts/admin-api-contract.md](contracts/admin-api-contract.md)), que substitui as suposições iniciais por endpoints e comportamentos confirmados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Buscar tenant e visualizar contexto (Priority: P1)

Como administrador autenticado, quero buscar um tenant por nome ou ID na tela "Adicionar Novo Tenant", selecionar o tenant correto entre os resultados e ver qual prompt está vinculado a ele (ou o prompt padrão, quando não houver vínculo) e quais guardrails se aplicam, antes de gerenciar sua base de conhecimento.

**Why this priority**: Sem essa busca, o administrador edita a base de conhecimento de um tenant "às cegas", sem saber que comportamento de IA e quais regras de segurança já estão configurados. É a base de contexto para as demais histórias e entrega valor de forma independente (visibilidade).

**Independent Test**: Pode ser testado acessando `/admin`, informando um termo (nome ou ID parcial) no campo de busca, selecionando um tenant entre os resultados e confirmando que o prompt aplicável (vinculado ou padrão, com indicador correspondente) e os guardrails associados são exibidos; um termo sem correspondência deve mostrar o estado "nenhum tenant encontrado" sem bloquear nova busca.

**Acceptance Scenarios**:

1. **Given** que o administrador está na tela "Adicionar Novo Tenant", **When** informa um termo de busca (nome ou ID, mínimo 1 caractere) e aciona "Buscar", **Then** o sistema consulta `GET /api/v1/tenants?q=&limit=` e exibe estado de carregamento até a conclusão.
2. **Given** que a busca retorna um ou mais tenants, **When** a busca termina, **Then** a interface exibe os resultados em uma lista selecionável com nome e ID de cada tenant.
3. **Given** que a busca não encontra nenhum tenant correspondente, **When** a busca termina, **Then** a interface exibe "Nenhum tenant encontrado" sem tratar isso como erro, permitindo nova busca.
4. **Given** que o administrador seleciona um tenant da lista de resultados, **When** a seleção ocorre, **Then** o sistema consulta `GET /api/v1/prompt-manager/tenant/{tenant_id}` e exibe estado de carregamento até a conclusão.
5. **Given** que o tenant selecionado possui um vínculo de prompt customizado (`is_default_prompt: false`), **When** a consulta termina, **Then** o título do prompt vinculado e a lista de guardrails associados (com indicador "Global" quando aplicável) são exibidos de forma legível.
6. **Given** que o tenant selecionado não possui vínculo customizado (`is_default_prompt: true`), **When** a consulta termina, **Then** a interface indica claramente que está usando o prompt padrão do sistema, junto com os guardrails globais aplicáveis, sem impedir a gestão da base de conhecimento.
7. **Given** que o termo de busca informado está vazio ou contém apenas espaços, **When** o administrador aciona "Buscar", **Then** a busca não é enviada e uma mensagem de obrigatoriedade é exibida.
8. **Given** que ocorre falha de conexão ou resposta inesperada em qualquer etapa (busca ou seleção), **When** a operação termina, **Then** a interface preserva o termo/seleção, exibe mensagem de erro e oferece nova tentativa.

---

### User Story 2 - Criar ou editar a base de conhecimento do tenant (Priority: P2)

Como administrador autenticado, quero visualizar o conteúdo atual da base de conhecimento de um tenant selecionado e salvá-lo (seja criando pela primeira vez ou atualizando o que já existe), para manter as informações usadas pela IA corretas sem duplicar registros.

**Why this priority**: Atualmente só é possível adicionar texto novo, sem revisar ou corrigir o que já existe — isso gera acúmulo de conteúdo desatualizado ou conflitante. Depende do tenant já ter sido selecionado (US1), mas entrega o valor central da feature. Como o backend expõe um único endpoint de upsert, criar e editar são a mesma operação do ponto de vista do administrador.

**Independent Test**: Pode ser testado selecionando um tenant que já possui base de conhecimento, alterando o texto exibido e confirmando que a atualização é enviada com feedback de sucesso e o conteúdo exibido reflete a alteração; e, separadamente, selecionando um tenant sem base de conhecimento, informando um conteúdo novo e confirmando que ele é salvo e passa a ser exibido.

**Acceptance Scenarios**:

1. **Given** que um tenant foi selecionado e possui base de conhecimento existente, **When** a consulta termina, **Then** o conteúdo atual é exibido em uma área de texto editável, com estado de carregamento até a leitura ser concluída.
2. **Given** que o tenant selecionado ainda não possui base de conhecimento (`content: null`), **When** a consulta termina, **Then** a interface exibe "Nenhuma base de conhecimento cadastrada para este tenant" e apresenta a área de texto vazia, pronta para receber o primeiro conteúdo.
3. **Given** que o administrador informa ou altera o conteúdo exibido, **When** confirma o salvamento, **Then** o sistema valida que o conteúdo não está vazio, bloqueia novos envios durante o processamento e exibe indicador de carregamento na ação.
4. **Given** que o salvamento foi concluído, **When** o sistema recebe a confirmação, **Then** a interface exibe "Base de conhecimento salva com sucesso" e o conteúdo exibido reflete o valor salvo — a confirmação chega assim que o texto é persistido, sem esperar a revetorização em segundo plano (que pode levar alguns minutos para refletir no comportamento da IA).
5. **Given** que o salvamento falha, **When** o erro é recebido, **Then** o conteúdo editado é preservado na tela e uma mensagem de erro é exibida.
6. **Given** que o conteúdo está vazio ou contém apenas espaços, **When** o administrador tenta salvar, **Then** o envio é bloqueado e a mensagem de obrigatoriedade é exibida.
7. **Given** que o conteúdo editado excede 100.000 caracteres, **When** o administrador tenta salvar, **Then** o envio é bloqueado e a mensagem de limite é exibida.

---

### User Story 3 - Excluir a base de conhecimento do tenant (Priority: P3)

Como administrador autenticado, quero excluir a base de conhecimento existente de um tenant após confirmação explícita, para remover conteúdo obsoleto antes de cadastrar um substituto.

**Why this priority**: É uma ação destrutiva e complementar à edição — necessária para os casos em que o conteúdo antigo deve ser totalmente removido em vez de corrigido, mas não bloqueia o valor central de busca e edição já entregue pelas histórias anteriores.

**Independent Test**: Pode ser testado selecionando um tenant com base de conhecimento existente, acionando "Excluir", confirmando no diálogo e verificando que o conteúdo deixa de ser exibido com mensagem de sucesso, restando a área de texto vazia pronta para um novo conteúdo.

**Acceptance Scenarios**:

1. **Given** que um tenant com base de conhecimento foi selecionado, **When** o administrador aciona "Excluir", **Then** um diálogo de confirmação exibe o ID do tenant e a mensagem "Esta ação não poderá ser desfeita.", com as ações "Cancelar" e "Excluir".
2. **Given** que o diálogo está aberto, **When** o administrador cancela ou pressiona Escape, **Then** nenhuma exclusão ocorre e o foco retorna ao controle que abriu o diálogo.
3. **Given** que o administrador confirma a exclusão, **When** a solicitação está em andamento, **Then** a ação indica carregamento e novas confirmações ficam bloqueadas.
4. **Given** que a exclusão foi concluída, **When** a confirmação é recebida, **Then** o conteúdo deixa de ser exibido, a interface anuncia "Base de conhecimento excluída com sucesso" e a área de texto fica vazia, pronta para receber um novo conteúdo.
5. **Given** que a exclusão falha, **When** o erro é recebido, **Then** o conteúdo exibido permanece inalterado e uma mensagem de erro é exibida.

---

### Edge Cases

- Busca retorna múltiplos tenants com nomes semelhantes — o administrador precisa distinguir pelo ID exibido junto ao nome.
- Administrador alterna rapidamente entre tenants diferentes durante uma operação pendente (edição/exclusão em andamento não deve ser aplicada ao tenant errado).
- Respostas atrasadas ou obsoletas de buscas/seleções anteriores que poderiam sobrescrever os dados exibidos para o tenant atual.
- O backend passa a exigir e rejeitar (401) chamadas sem `Authorization: Bearer <admin JWT>` antes de a feature de login administrativo com JWT existir (ver Assumptions) — a integração desta feature ficaria bloqueada nesse cenário.
- Conteúdo da base de conhecimento contém caracteres especiais ou é extremamente longo.
- Administrador tenta excluir a base de conhecimento de um tenant que ainda não possui nenhum conteúdo cadastrado (ação deve estar indisponível/desabilitada).
- Administrador salva um novo conteúdo poucos segundos após uma exclusão, antes da revetorização em segundo plano da exclusão anterior terminar.
- Falha de rede durante busca, seleção, leitura, salvamento ou exclusão da base de conhecimento.

## Requirements *(mandatory)*

### Functional Requirements

**Busca e Contexto do Tenant**

- **FR-001**: A tela "Adicionar Novo Tenant" (`AdminDashboard`) DEVE apresentar um campo de busca por termo (nome ou ID, mínimo 1 caractere) com ação "Buscar", substituindo o campo de ID exato hoje usado apenas para ingestão.
- **FR-002**: A busca DEVE consultar `GET /api/v1/tenants?q={termo}&limit={n}` e exibir estado de carregamento até a conclusão; lista vazia é um resultado válido, não um erro.
- **FR-003**: Os resultados DEVEM ser exibidos em uma lista selecionável com nome e ID de cada tenant.
- **FR-004**: Ao selecionar um tenant da lista, o sistema DEVE consultar `GET /api/v1/prompt-manager/tenant/{tenant_id}` e exibir estado de carregamento até a conclusão.
- **FR-005**: Quando `is_default_prompt` é `false`, o sistema DEVE exibir o título do prompt vinculado e a lista de guardrails associados, incluindo indicador de escopo global quando aplicável.
- **FR-006**: Quando `is_default_prompt` é `true`, o sistema DEVE indicar claramente que o tenant está usando o prompt padrão do sistema (não um vínculo customizado), junto com os guardrails globais retornados, sem bloquear a gestão da base de conhecimento.
- **FR-007**: A busca com termo vazio ou apenas espaços NÃO DEVE ser enviada; o sistema DEVE exibir mensagem de obrigatoriedade junto ao campo.
- **FR-008**: Falhas de busca ou de consulta de contexto (rede, erro inesperado) DEVEM preservar o termo/seleção e permitir nova tentativa sem perda de contexto.

**Visualizar, Criar e Editar a Base de Conhecimento**

- **FR-009**: Após a seleção de um tenant, o sistema DEVE consultar `GET /api/v1/tenants/{tenant_id}/knowledge-base` e exibir o conteúdo atual (ou área vazia quando `content` é `null`), com estado de carregamento até a conclusão.
- **FR-010**: O sistema DEVE permitir editar o conteúdo em um campo de texto, validando obrigatoriedade (não vazio após trim) e um limite de 100.000 caracteres como salvaguarda de UI (o contrato do backend exige apenas conteúdo não vazio).
- **FR-011**: O salvamento DEVE chamar `PUT /api/v1/tenants/{tenant_id}/knowledge-base` com `{ content }`, usada tanto para criar quanto para atualizar a base de conhecimento — não existe uma operação de "adicionar" distinta da edição; ambas usam o mesmo formulário e o mesmo endpoint de upsert.
- **FR-012**: O sistema DEVE bloquear novos envios durante o processamento e exibir indicador de carregamento na ação de salvar.
- **FR-013**: Em sucesso do salvamento, o sistema DEVE exibir "Base de conhecimento salva com sucesso" e refletir o novo conteúdo na tela, informando que a atualização do comportamento da IA pode levar alguns minutos (revetorização em segundo plano).
- **FR-014**: Em falha do salvamento, o sistema DEVE preservar o conteúdo editado na tela e exibir mensagem de erro.

**Excluir a Base de Conhecimento**

- **FR-015**: Quando o tenant selecionado possui base de conhecimento (`content` não nulo), o sistema DEVE oferecer a ação "Excluir", indisponível quando não há conteúdo cadastrado.
- **FR-016**: A exclusão DEVE chamar `DELETE /api/v1/tenants/{tenant_id}/knowledge-base` somente após confirmação explícita em diálogo que apresenta o ID do tenant e a mensagem "Esta ação não poderá ser desfeita.".
- **FR-017**: Cancelar o diálogo ou pressionar Escape NÃO DEVE excluir conteúdo e DEVE devolver o foco ao controle que abriu o diálogo.
- **FR-018**: A confirmação de exclusão DEVE bloquear novas confirmações durante o processamento e indicar carregamento na ação destrutiva.
- **FR-019**: Em sucesso da exclusão, o sistema DEVE limpar o conteúdo exibido, anunciar "Base de conhecimento excluída com sucesso" e deixar a área de texto pronta para um novo conteúdo.
- **FR-020**: Em falha da exclusão, o conteúdo exibido DEVE permanecer inalterado e uma mensagem de erro DEVE ser exibida.

**Autenticação com o Backend**

- **FR-021**: Esta feature NÃO DEVE implementar emissão, armazenamento ou anexação de um token `Authorization: Bearer <admin JWT>` às chamadas de backend — o acesso à tela `/admin` continua protegido apenas pelo mecanismo de sessão administrativa já existente (login com `ADM_USER`/`ADM_PWD`). A emissão de JWT para o backend é escopo de uma feature futura de login administrativo (ver Assumptions).
- **FR-022**: Caso o backend rejeite (401) uma chamada por ausência do token, o sistema DEVE tratá-la como uma falha genérica de operação (mensagem de erro, dados preservados, nova tentativa permitida), sem expor detalhes de autenticação ao administrador.

**Validação, Concorrência e Feedback**

- **FR-023**: Ao iniciar uma nova busca ou selecionar outro tenant, quaisquer operações de salvamento/exclusão em andamento para o tenant anterior NÃO DEVEM afetar o tenant recém-selecionado; respostas atrasadas de buscas/consultas anteriores DEVEM ser descartadas.
- **FR-024**: Todo feedback de sucesso ou erro DEVE ser anunciado visualmente e por tecnologia assistiva.
- **FR-025**: Em falha de rede ou timeout em qualquer operação (busca, seleção, leitura, salvamento, exclusão), o sistema DEVE exibir "Não foi possível conectar ao servidor. Verifique sua conexão." e permitir nova tentativa.

**Acessibilidade e Responsividade**

- **FR-026**: Todos os campos e ações DEVEM ter labels associadas e ser operáveis por teclado.
- **FR-027**: O layout DEVE permanecer utilizável e sem sobreposição ou transbordamento em viewports a partir de 375px de largura (mobile) até desktop.

**Componentização**

- **FR-028**: A busca de tenant e exibição de contexto (prompt/guardrails) DEVEM reutilizar os tipos e a camada de serviço já existentes (`fetchTenantPromptDetail`, `TenantPromptDetail`) em vez de duplicar lógica.
- **FR-029**: As chamadas de busca de tenant e de leitura/salvamento/exclusão da base de conhecimento DEVEM ser centralizadas em uma camada de serviço dedicada, sem requisições HTTP diretas nos componentes visuais.
- **FR-030**: O sistema NÃO DEVE registrar em logs o conteúdo integral da base de conhecimento de um tenant.

### Key Entities

- **Resultado de Busca de Tenant**: item retornado por `GET /tenants?q=`, com `id`, `name` e demais campos do tenant, usado apenas para seleção na lista de resultados.
- **Vínculo Tenant-Prompt** *(reaproveitado da feature 015, com o novo campo `is_default_prompt`)*: associação entre tenant e prompt, com `tenant_id`, `prompt_id`, indicador de padrão e lista de guardrails associados.
- **Guardrail** *(reaproveitado da feature 015)*: regra de segurança/comportamento com título e indicador de escopo (global/específico).
- **Base de Conhecimento**: conteúdo textual (`content`, anulável) associado a um `tenant_id`, usado para vetorização em RAG. É um documento único por tenant, gerenciado por um único endpoint de upsert (criar/atualizar) mais leitura e exclusão.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administradores conseguem localizar e selecionar um tenant em até 10 segundos após informar um termo de busca válido.
- **SC-002**: Administradores conseguem ver o contexto (prompt e guardrails) de um tenant selecionado em até 5 segundos após a seleção.
- **SC-003**: Administradores conseguem editar e salvar a base de conhecimento de um tenant selecionado em até 2 minutos.
- **SC-004**: 100% das operações de busca, seleção, salvamento e exclusão exibem feedback apropriado (sucesso ou erro) — nenhuma operação silenciosa.
- **SC-005**: A interface permanece responsiva e utilizável em viewports a partir de 375px de largura.
- **SC-006**: Nenhuma exclusão de base de conhecimento ocorre sem confirmação explícita do administrador — 100% das exclusões passam pelo diálogo de confirmação.
- **SC-007**: Trocar de um tenant selecionado para outro não exibe, em nenhum caso observado em teste, dados desatualizados do tenant anterior.

## Assumptions

- Os seis endpoints descritos em [contracts/admin-api-contract.md](contracts/admin-api-contract.md) — busca de tenant, detalhe de tenant, contexto prompt/guardrail e as três operações de base de conhecimento — são a fonte de verdade para esta feature, confirmados pela equipe de backend em 2026-08-19.
- **Autenticação com o backend está fora do escopo desta feature.** O contrato especifica `Authorization: Bearer <admin JWT>` em todos os seis endpoints, mas o mecanismo atual de proteção de `/admin` é uma sessão de servidor baseada em credenciais de ambiente (`ADM_USER`/`ADM_PWD`, `ADMIN_SESSION_SECRET`), sem emissão de JWT. Por decisão do usuário, esta feature assume que essas chamadas funcionarão a partir da sessão administrativa atual sem anexar esse header; a emissão de JWT para o backend será tratada por uma feature futura de login administrativo com autenticação no backend. Se o backend passar a rejeitar chamadas sem o token antes dessa feature futura existir, a integração fica bloqueada (ver Edge Cases).
- A base de conhecimento é tratada como um único documento textual por tenant, conforme confirmado pelo contrato (`content` único, anulável, por `tenant_id`).
- O endpoint `PUT /tenants/{tenant_id}/knowledge-base` substitui, para esta tela, o fluxo anterior de ingestão via `POST /api/v1/ingest/text` (backend Python de agendamento); esse endpoint legado não é mais usado por esta tela após a implementação desta feature.
- A revetorização da base de conhecimento após salvar ou excluir ocorre em segundo plano (até ~5 minutos no pior caso, conforme o contrato); a leitura do texto salvo é imediata e a interface não precisa aguardar a revetorização para confirmar sucesso.
- O idioma da interface administrativa é Português (Brasil), consistente com as telas administrativas existentes.
- Testes unitários e de integração seguem o padrão já estabelecido no projeto para componentes e hooks administrativos.
