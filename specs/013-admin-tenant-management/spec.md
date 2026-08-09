# Feature Specification: Gerenciamento Administrativo de Tenants

**Feature Branch**: `Edilson-013-Dev`  
**Created**: 2026-08-08  
**Status**: Draft  
**Input**: User description: "Adicionar ao frontend existente uma área administrativa para cadastrar, consultar, editar e excluir tenants, respeitando os padrões atuais e os contratos disponíveis no backend."

## Resumo Funcional

A área administrativa deve ganhar uma opção "Tenants", visível apenas a administradores autenticados, para gerenciar os tenants da plataforma. A primeira versão deve permitir cadastrar tenants e consultá-los por ID; a partir de um tenant consultado, deve permitir edição e exclusão. Como o backend ainda não oferece listagem geral, a tela não deve inventar nem chamar uma rota de listagem e deve permanecer preparada para incorporar uma tabela quando essa dependência estiver disponível.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar tenant (Priority: P1)

Como administrador autenticado, quero cadastrar um tenant com nome e ID do Google Calendar, para disponibilizá-lo às demais funcionalidades da plataforma.

**Why this priority**: O cadastro é o objetivo principal da primeira versão e entrega valor sem depender de uma rota de listagem.

**Independent Test**: Pode ser testado acessando "Tenants", abrindo "Novo tenant", preenchendo os dois campos e confirmando que o tenant é criado com feedback de sucesso.

**Acceptance Scenarios**:

1. **Given** que um administrador autenticado está na área administrativa, **When** visualiza a navegação, **Then** encontra a opção "Tenants" com ícone coerente, e o item apresenta o estado ativo padrão ao acessar `/admin/tenants`.
2. **Given** que o administrador acessou a página de tenants, **When** aciona "Novo tenant", **Then** um formulário acessível é aberto com os campos "ID do tenant", "Nome do tenant" e "ID do Google Calendar", além das ações "Cancelar" e "Cadastrar tenant".
3. **Given** que um dos campos está vazio ou contém somente espaços, **When** o administrador tenta cadastrar, **Then** a solicitação não é enviada e a mensagem de obrigatoriedade é exibida junto ao campo correspondente.
4. **Given** que os dois campos são válidos, **When** o administrador confirma o cadastro, **Then** o sistema envia os valores normalizados, bloqueia novos envios durante o processamento e apresenta um indicador de carregamento na ação principal.
5. **Given** que o cadastro foi concluído, **When** o sistema recebe a confirmação, **Then** o formulário é fechado ou limpo e a notificação "Tenant cadastrado com sucesso" é anunciada visualmente e por tecnologia assistiva.
6. **Given** que o cadastro falha, **When** o sistema recebe erro de validação ou erro inesperado, **Then** o formulário permanece aberto, preserva os dados, associa erros de campo quando disponíveis e apresenta feedback geral quando necessário.

---

### User Story 2 - Consultar tenant por ID (Priority: P2)

Como administrador autenticado, quero localizar um tenant por seu ID, para conferir seus dados mesmo sem uma listagem geral disponível.

**Why this priority**: A consulta torna os tenants existentes acessíveis e viabiliza manutenção sem depender do endpoint de listagem ausente.

**Independent Test**: Pode ser testado informando um ID conhecido e confirmando a apresentação de `id`, nome, ID do Google Calendar e datas disponíveis; um ID inexistente deve produzir a mensagem definida de não encontrado.

**Acceptance Scenarios**:

1. **Given** que o administrador está na página de tenants, **When** informa um ID não vazio e solicita a consulta, **Then** o sistema busca exatamente esse tenant e apresenta estado de carregamento até a conclusão.
2. **Given** que o tenant existe, **When** a consulta termina, **Then** seus dados são apresentados de forma legível, incluindo identificação, nome, calendário e informações temporais retornadas.
3. **Given** que o serviço responde com 404, **When** a consulta termina, **Then** a interface apresenta "Tenant não encontrado" e permite outra consulta.
4. **Given** que ocorre uma falha de conexão ou resposta inesperada, **When** a consulta termina, **Then** a interface preserva o ID informado e apresenta "Não foi possível concluir a operação. Tente novamente.".

---

### User Story 3 - Editar tenant consultado (Priority: P3)

Como administrador autenticado, quero alterar o nome e o ID do Google Calendar de um tenant localizado, para manter sua configuração atualizada.

**Why this priority**: A edição complementa o gerenciamento e depende do tenant previamente localizado, mas não é necessária para validar o cadastro inicial.

**Independent Test**: Pode ser testado consultando um tenant, alterando os campos e verificando a confirmação "Tenant atualizado com sucesso" e os valores atualizados na interface.

**Acceptance Scenarios**:

1. **Given** que um tenant foi consultado com sucesso, **When** o administrador inicia a edição, **Then** o formulário apresenta os valores atuais de nome e ID do Google Calendar.
2. **Given** que o administrador informa valores válidos, **When** confirma a edição, **Then** o sistema impede envio duplicado e solicita a atualização do tenant pelo ID consultado.
3. **Given** que a atualização foi concluída, **When** a confirmação é recebida, **Then** a interface reflete os dados atuais e apresenta "Tenant atualizado com sucesso".
4. **Given** que a atualização falha, **When** o erro é recebido, **Then** o formulário permanece aberto, preserva as alterações e apresenta erros de campo ou feedback geral conforme a natureza da falha.

---

### User Story 4 - Excluir tenant consultado (Priority: P4)

Como administrador autenticado, quero excluir um tenant após confirmar explicitamente a ação, para remover uma configuração que não deve mais ser utilizada.

**Why this priority**: É uma ação destrutiva e secundária que depende da consulta, exigindo confirmação e feedback robustos.

**Independent Test**: Pode ser testado consultando um tenant, acionando a exclusão, verificando o diálogo com seu nome e confirmando que o sucesso remove os dados exibidos e apresenta a mensagem definida.

**Acceptance Scenarios**:

1. **Given** que um tenant foi consultado, **When** o administrador aciona excluir, **Then** um diálogo com foco controlado apresenta o título "Excluir tenant?", o nome do tenant, a mensagem "Esta ação não poderá ser desfeita." e as ações "Cancelar" e "Excluir".
2. **Given** que o diálogo está aberto, **When** o administrador cancela ou pressiona Escape, **Then** nenhuma exclusão ocorre e o foco retorna ao controle que abriu o diálogo.
3. **Given** que o administrador confirma a exclusão, **When** a solicitação está em andamento, **Then** a ação destrutiva indica carregamento e novas confirmações ficam bloqueadas.
4. **Given** que a exclusão foi concluída, **When** a confirmação é recebida, **Then** os dados do tenant deixam de ser apresentados e a interface anuncia "Tenant excluído com sucesso".
5. **Given** que a exclusão falha, **When** o erro é recebido, **Then** o tenant continua visível e a interface apresenta feedback sem indicar sucesso indevido.

### Fluxo do Usuário

1. O administrador autentica-se pela entrada administrativa existente.
2. A navegação autorizada exibe "Tenants"; o administrador acessa `/admin/tenants`.
3. Para cadastrar, aciona "Novo tenant", preenche nome e ID do Google Calendar e confirma.
4. Para localizar um registro existente, informa o ID do tenant e executa a consulta.
5. Após uma consulta bem-sucedida, pode editar os dados ou iniciar a exclusão.
6. Para excluir, revisa o nome no diálogo e confirma uma ação explicitamente destrutiva.
7. Em qualquer falha, permanece no contexto atual, recebe feedback e pode corrigir ou repetir a operação.

### Edge Cases

- Um usuário sem sessão administrativa tenta acessar diretamente `/admin/tenants`.
- Nome ou ID do Google Calendar contém apenas espaços ou espaços nas extremidades.
- O administrador pressiona repetidamente a ação de cadastro, consulta, edição ou exclusão durante uma solicitação ativa.
- A API retorna erros de validação associados a um campo, um formato de erro geral ou conteúdo que não corresponde ao contrato esperado.
- O tenant deixa de existir entre a consulta e a edição ou exclusão.
- A consulta ou mutação recebe 404 e deve substituir mensagens genéricas por "Tenant não encontrado".
- Uma resposta atrasada de operação anterior chega após uma solicitação mais recente e não deve sobrescrever o estado atual.
- O administrador fecha o formulário ou diálogo por Escape durante uma operação ativa; a interface não deve gerar uma segunda solicitação nem perder o controle de foco.
- A resposta contém `deleted_at` preenchido; o registro deve ser tratado como excluído e não como tenant ativo editável.
- Textos longos e IDs extensos são usados em tela pequena sem ultrapassar contêineres ou tornar ações inacessíveis.
- A rota de listagem geral permanece indisponível; nenhum estado deve tentar carregá-la implicitamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir a opção "Tenants" na navegação administrativa somente para usuários com permissão administrativa válida.
- **FR-002**: A opção "Tenants" DEVE direcionar para `/admin/tenants`, utilizar um ícone existente que represente organização, empresa ou usuários e adotar o mesmo estado ativo dos demais itens administrativos.
- **FR-003**: A rota `/admin/tenants` DEVE aplicar a proteção de acesso administrativa existente inclusive em acesso direto.
- **FR-004**: A página DEVE apresentar o título "Tenants" e a ação principal "Novo tenant", sem textos promocionais ou instruções extensas.
- **FR-005**: A ação "Novo tenant" DEVE abrir o padrão de formulário sobreposto adotado pelo produto, com foco inicial controlado, fechamento por Escape e retorno de foco ao acionador.
- **FR-006**: O cadastro DEVE exigir "ID do tenant", "Nome do tenant" e "ID do Google Calendar", rejeitando valores vazios ou compostos somente por espaços.
- **FR-007**: Antes do envio, o sistema DEVE remover espaços das extremidades de `tenant_id`, `name` e `google_calendar_id` sem alterar o conteúdo interno.
- **FR-008**: O cadastro DEVE enviar somente `tenant_id`, `name` e `google_calendar_id` para a operação oficial de criação de tenant.
- **FR-009**: O sistema DEVE desabilitar a confirmação, exibir carregamento e impedir envios duplicados enquanto qualquer mutação estiver em andamento.
- **FR-010**: Em sucesso de cadastro, o sistema DEVE fechar ou limpar o formulário e anunciar "Tenant cadastrado com sucesso".
- **FR-011**: Em erro de validação atribuído a campos, o sistema DEVE apresentar mensagens junto aos campos correspondentes e anunciá-las por tecnologia assistiva.
- **FR-012**: Em falha inesperada, o sistema DEVE manter o formulário aberto, preservar dados editáveis e anunciar "Não foi possível concluir a operação. Tente novamente.".
- **FR-013**: A página DEVE permitir consultar um tenant por ID não vazio, sem depender de uma listagem geral.
- **FR-014**: A consulta bem-sucedida DEVE apresentar `id`, `name`, `google_calendar_id`, `created_at`, `updated_at` e `deleted_at` quando retornados.
- **FR-015**: Respostas 404 de consulta, edição ou exclusão DEVEM produzir a mensagem "Tenant não encontrado".
- **FR-016**: A partir de um tenant ativo consultado, o sistema DEVE permitir editar `name` e `google_calendar_id`, aplicando as mesmas regras de validação do cadastro.
- **FR-017**: Em sucesso de edição, o sistema DEVE atualizar os dados apresentados e anunciar "Tenant atualizado com sucesso".
- **FR-018**: A partir de um tenant ativo consultado, o sistema DEVE permitir iniciar exclusão por uma ação com estilo destrutivo.
- **FR-019**: Antes de excluir, o sistema DEVE exibir um diálogo com o nome do tenant, título "Excluir tenant?", mensagem "Esta ação não poderá ser desfeita." e ações "Cancelar" e "Excluir".
- **FR-020**: Em sucesso de exclusão, o sistema DEVE remover o tenant da visualização ativa e anunciar "Tenant excluído com sucesso".
- **FR-021**: A interface DEVE diferenciar carregamento inicial, envio, sucesso, validação, falha de conexão, erro da API, tenant não encontrado, ausência de resultado e confirmação de exclusão sem depender somente de cor.
- **FR-022**: Todos os campos DEVEM possuir labels associadas; erros e notificações DEVEM ser anunciados; todos os controles DEVEM funcionar por teclado.
- **FR-023**: Formulários, diálogos, textos e ações DEVEM permanecer utilizáveis sem sobreposição ou transbordamento nas larguras desktop e mobile suportadas.
- **FR-024**: O sistema NÃO DEVE chamar nem simular uma operação de listagem geral enquanto `GET /api/v1/tenants/` não existir.
- **FR-025**: A composição da página DEVE reservar uma região substituível para futura listagem, sem exibir tabela vazia que sugira uma consulta inexistente.
- **FR-026**: Chamadas de tenant DEVEM permanecer centralizadas na camada de integração existente, e componentes visuais NÃO DEVEM iniciar requisições HTTP diretamente.
- **FR-027**: O sistema NÃO DEVE registrar em logs os valores de `name`, `google_calendar_id`, IDs consultados ou o conteúdo dos formulários.
- **FR-028**: Respostas atrasadas ou obsoletas NÃO DEVEM substituir o resultado da operação mais recente.
- **FR-029**: Respostas bem-sucedidas incompatíveis com o contrato esperado DEVEM ser tratadas como falha inesperada, sem presumir campos ausentes.
- **FR-030**: Quando a listagem de tenants for disponibilizada pelo backend, o cadastro, edição e exclusão DEVEM permitir atualização do conjunto visível sem recarregar toda a página.

### Estrutura de Componentes e Responsabilidades

- **Rota administrativa de tenants**: verifica autorização antes de apresentar a experiência e define o título da página.
- **Navegação administrativa**: apresenta itens permitidos, ícones, destino e estado ativo a partir de uma fonte compartilhada.
- **Página de tenants**: coordena cabeçalho, ação principal, consulta por ID, resultado atual e região futura de listagem.
- **Formulário de tenant**: atende cadastro e edição, associa labels e erros, aplica validação e expõe ações de cancelar e confirmar.
- **Consulta por ID**: recebe o identificador, apresenta carregamento e aciona a busca sem inferir uma listagem.
- **Detalhes do tenant**: apresenta os dados retornados e disponibiliza edição e exclusão para registros ativos.
- **Diálogo de exclusão**: controla foco, identifica o tenant, exige confirmação explícita e usa tratamento visual destrutivo.
- **Notificação de operação**: anuncia sucesso e falhas gerais sem substituir mensagens específicas de campo.
- **Camada de estado da feature**: controla operação ativa, prevenção de duplicidade, descarte de respostas obsoletas e sincronização do tenant consultado.
- **Serviço de tenants**: centraliza configuração HTTP, serialização, interpretação de respostas e normalização de falhas.

### Contratos da API

| Operação | Método e rota | Entrada | Resultado esperado |
|---|---|---|---|
| Cadastrar | `POST /api/v1/tenants/` | `{ tenant_id, name, google_calendar_id }` | Tenant criado ou erro normalizado |
| Consultar por ID | `GET /api/v1/tenants/{tenant_id}` | ID no caminho | Tenant encontrado ou 404 |
| Atualizar | `PUT /api/v1/tenants/{tenant_id}` | `{ name, google_calendar_id }` | Tenant atualizado ou erro normalizado |
| Excluir | `DELETE /api/v1/tenants/{tenant_id}` | ID no caminho | Confirmação de exclusão ou erro normalizado |

Em desenvolvimento, a base informada pelo backend é `http://localhost:8000/api/v1`. A configuração efetiva deve continuar variando por ambiente conforme o mecanismo já existente. Não existe contrato para `GET /api/v1/tenants/` nesta entrega.

### Contratos e Tipos TypeScript

```ts
export type TenantWriteInput = {
  name: string;
  google_calendar_id: string;
};

export type TenantCreateInput = TenantWriteInput & {
  tenant_id: string;
};

export type Tenant = {
  id: string;
  name: string;
  google_calendar_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type TenantFieldErrors = Partial<
  Record<keyof TenantWriteInput, string>
>;

export type TenantOperationFailure = {
  ok: false;
  status: number;
  message: string;
  fieldErrors?: TenantFieldErrors;
  retryable: boolean;
};

export type TenantOperationSuccess = {
  ok: true;
  status: number;
  tenant: Tenant;
};

export type TenantDeleteSuccess = {
  ok: true;
  status: number;
};

export type TenantOperationResult =
  | TenantOperationSuccess
  | TenantOperationFailure;

export type TenantDeleteResult =
  | TenantDeleteSuccess
  | TenantOperationFailure;
```

O contrato de exclusão deve ser ajustado no planejamento caso o backend confirme que devolve um tenant em vez de resposta sem corpo. Nenhum consumidor deve depender dessa forma antes da correção da inconsistência de `TenantResponse`.

### Estratégia de Integração com a API

- Estender a camada de serviços já utilizada pelo frontend com operações equivalentes a `createTenant`, `getTenantById`, `updateTenant` e `deleteTenant`.
- Reutilizar a configuração por ambiente, o tratamento seguro de JSON e o modelo de resultado discriminado já adotados pelo cliente existente.
- Enviar `Content-Type: application/json` nas operações com corpo e serializar somente os campos previstos.
- Traduzir 404 para "Tenant não encontrado", erros de validação para mensagens de campo quando identificáveis, falhas de rede para resultado repetível e demais falhas para a mensagem inesperada definida.
- Validar a forma de respostas de sucesso antes de disponibilizá-las à interface, devido à inconsistência conhecida no `TenantResponse`.
- Não registrar payloads, IDs ou respostas que contenham dados de tenant.
- Não adicionar cache ou consulta de coleção enquanto a rota de listagem não existir.

### Estados da Interface

| Estado | Apresentação e comportamento obrigatório |
|---|---|
| Inicial | Título, "Novo tenant" e consulta por ID disponíveis; sem tabela fictícia |
| Carregamento de consulta | Indicador associado à consulta e prevenção de nova consulta concorrente |
| Envio de formulário | Confirmação desabilitada, indicador no botão e prevenção de duplicidade |
| Sucesso | Notificação com texto específico da operação e atualização do contexto visível |
| Validação | Mensagem próxima ao campo, associação acessível e nenhum envio |
| Erro de conexão | Formulário ou consulta preservados e mensagem geral anunciada |
| Erro da API | Mensagem segura; associação a campo quando o contrato permitir |
| Não encontrado | Texto "Tenant não encontrado" e possibilidade de nova consulta |
| Sem resultado | Região de detalhes ausente, sem sugerir que uma lista foi carregada |
| Confirmação de exclusão | Diálogo focado, nome do tenant e ação destrutiva explícita |
| Excluído | Detalhes removidos e notificação de sucesso |

### Regras de Validação

- `tenant_id` de cadastro: obrigatório após remoção de espaços nas extremidades e enviado no corpo do POST.
- `name`: obrigatório após remoção de espaços nas extremidades; valores compostos somente por espaços são inválidos.
- `google_calendar_id`: obrigatório após remoção de espaços nas extremidades; valores compostos somente por espaços são inválidos. O frontend não deve restringir o valor a um único domínio, mas deve aceitar exemplos como `agenda@group.calendar.google.com`.
- `tenant_id` de consulta: obrigatório após remoção de espaços nas extremidades e enviado no segmento de rota com codificação segura.
- Mensagens locais de obrigatoriedade devem identificar claramente o campo.
- Regras retornadas pelo backend devem prevalecer para validações de domínio não conhecidas pelo frontend.
- O mesmo conjunto de regras deve ser usado no cadastro e na edição.

### Cenários de Teste

- Exibição de "Tenants", ícone, destino e estado ativo na navegação administrativa.
- Ausência da opção e bloqueio da rota para usuário sem permissão administrativa.
- Abertura, foco inicial, fechamento por Cancelar e Escape e retorno de foco do formulário.
- Labels associadas, navegação por teclado e anúncio de erros e notificações.
- Validação de campos vazios, somente espaços e normalização de espaços nas extremidades.
- Payload exato do cadastro e ausência de dados extras.
- Loading no botão e bloqueio de cliques ou submissões duplicadas.
- Sucesso de cadastro, limpeza ou fechamento e notificação definida.
- Erros de campo, falha de rede, erro geral da API e preservação do formulário.
- Consulta por ID, renderização do tenant e tratamento específico de 404.
- Edição com valores iniciais, payload exato, prevenção de duplicidade e sucesso.
- Exclusão com nome no diálogo, estilo destrutivo, cancelamento e confirmação.
- Descarte de respostas obsoletas em operações concorrentes.
- Resposta de sucesso incompatível com o contrato tratada como falha.
- Confirmação de que nenhuma chamada a `GET /api/v1/tenants/` é realizada.
- Layout sem sobreposição, transbordamento ou perda de ações em desktop e mobile.
- Confirmação de que dados de formulário e IDs não são enviados a logs.

### Key Entities

- **Tenant**: Organização atendida pela plataforma, identificada por `id`, com nome, ID do Google Calendar, datas de criação e atualização e data opcional de exclusão.
- **TenantWriteInput**: Conjunto editável composto por nome e ID do Google Calendar, usado no cadastro e na edição.
- **TenantOperationState**: Estado observável da operação atual, incluindo tipo da ação, carregamento, sucesso, falha e erros por campo.
- **AdminPermission**: Autorização existente que controla tanto a visibilidade da navegação quanto o acesso direto à rota.

### Dependências e Pendências do Backend

- **Listagem ausente**: o backend não possui `GET /api/v1/tenants/`; uma tabela completa e sua atualização dependem da criação e documentação dessa rota.
- **Resposta inconsistente**: o schema `TenantResponse` não está consistente com os dados devolvidos por criação, consulta, atualização e exclusão. O backend deve corrigir e documentar o contrato; o frontend deve rejeitar respostas inesperadas sem fabricar valores.
- **Erros de validação**: o backend deve manter uma forma estável de associar erros aos campos `name` e `google_calendar_id` para permitir apresentação contextual confiável.
- **Exclusão**: o backend deve confirmar se a resposta de sucesso possui corpo e se representa exclusão lógica por `deleted_at` ou remoção definitiva.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 95% dos administradores em teste conseguem acessar "Tenants" e concluir um cadastro válido em até 2 minutos, sem orientação externa.
- **SC-002**: Em 100% dos testes, campos vazios ou compostos somente por espaços bloqueiam a solicitação e apresentam feedback junto ao campo correto.
- **SC-003**: Em 100% das operações testadas, apenas uma solicitação é enviada enquanto a ação correspondente permanece em andamento.
- **SC-004**: Em condições normais, a interface apresenta estado de carregamento em até 300 milissegundos após a confirmação e mantém feedback até sucesso ou falha.
- **SC-005**: Em 100% dos cenários de sucesso, o administrador recebe a mensagem específica da operação e os dados visíveis ficam coerentes com o resultado.
- **SC-006**: Em 100% dos cenários de 404, a interface apresenta "Tenant não encontrado"; em 100% das falhas inesperadas, apresenta a mensagem geral definida sem perder dados editáveis.
- **SC-007**: Todos os fluxos de cadastro, consulta, edição e exclusão são concluídos apenas por teclado e têm campos, erros, diálogos e notificações identificáveis por tecnologia assistiva.
- **SC-008**: Nas larguras móveis e desktop suportadas, 100% dos controles permanecem visíveis, acionáveis e contidos, sem sobreposição.
- **SC-009**: Nenhum teste de integração realiza chamada a endpoint de listagem inexistente ou registra conteúdo de formulário e IDs de tenant.
- **SC-010**: Pelo menos 90% dos administradores em teste conseguem consultar e atualizar um tenant conhecido em até 90 segundos.

## Critérios de Aceite

1. Um administrador acessa "Tenants" pela navegação administrativa, e usuários não autorizados não veem o item nem acessam diretamente a rota.
2. O formulário solicita ID do tenant, nome e ID do Google Calendar com labels associadas.
3. Campos obrigatórios são validados antes do envio e rejeitam valores compostos somente por espaços.
4. O cadastro utiliza `POST /api/v1/tenants/` com somente `tenant_id`, `name` e `google_calendar_id` normalizados.
5. O usuário recebe feedback acessível de carregamento, sucesso, validação, conexão, erro da API e não encontrado.
6. Envios duplicados e resultados obsoletos são impedidos.
7. Consulta por ID usa apenas `GET /api/v1/tenants/{tenant_id}` e habilita edição e exclusão do registro encontrado.
8. Edição e exclusão usam os contratos definidos, com confirmação destrutiva antes de excluir.
9. A tela funciona em desktop e mobile e reutiliza os padrões visuais, de formulário, autenticação e integração existentes.
10. Nenhum endpoint inexistente é utilizado, e a listagem geral permanece explicitamente dependente do backend.
11. A inconsistência de `TenantResponse` é tratada defensivamente no frontend e registrada como correção pendente do backend.
12. Nenhum dado de formulário ou identificador de tenant é armazenado em logs.

## Assumptions

- A sessão administrativa existente representa a permissão necessária; novos perfis ou uma matriz adicional de autorização estão fora desta entrega.
- O padrão atual de interface sobreposta será escolhido entre modal ou drawer durante o planejamento, preservando os requisitos de foco e responsividade.
- Edição e exclusão fazem parte desta versão porque os respectivos contratos foram fornecidos e podem ser acessados após consulta por ID.
- Datas retornadas serão apresentadas em formato legível ao usuário sem alterar os valores de domínio recebidos.
- A interface não validará a existência real do Google Calendar; essa regra pertence ao backend.
- A listagem futura terá seu próprio contrato e critérios quando o endpoint correspondente for disponibilizado.
