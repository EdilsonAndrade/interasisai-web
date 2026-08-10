# Feature Specification: Administração de Prompts e Guardrails

**Feature Branch**: `015-admin-prompt-guardrails`  
**Created**: 2026-08-10  
**Status**: Draft  
**Input**: User description: "Criar um painel de gerenciamento (CRUD) na área administrativa que permita gerenciar guardrails de segurança/comportamento, modelos de prompts do sistema, associações N:N entre guardrails e prompts, e vínculo de tenants a prompts com suporte a customização individual."

## Resumo Funcional

A área administrativa deve ganhar uma opção "Prompts & Guardrails", visível apenas a administradores autenticados, para gerenciar guardrails de segurança e prompts do sistema. A tela é estruturada em três abas: "Prompts Base" (CRUD de prompts com seleção N:N de guardrails), "Guardrails" (CRUD de guardrails) e "Vincular Tenant" (associação tenant-prompt com override de conteúdo opcional). A edição de conteúdo de prompts e guardrails utiliza um editor Markdown com preview em tempo real nos modos edição, visualização e lado a lado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gerenciar Guardrails (Priority: P1)

Como administrador autenticado, quero listar, criar, editar e excluir guardrails de segurança e comportamento do sistema, para definir regras que controlem as interações da IA.

**Why this priority**: Guardrails são a base de segurança do comportamento da IA. Sem eles, não há como restringir ou orientar as respostas do sistema, e são pré-requisito para a criação de prompts que os referenciam.

**Independent Test**: Pode ser testado acessando a aba "Guardrails", visualizando a listagem, criando um novo guardrail com título e conteúdo Markdown, editando-o e excluindo-o com confirmação.

**Acceptance Scenarios**:

1. **Given** que um administrador autenticado acessa a aba "Guardrails", **When** a página carrega, **Then** a listagem de todos os guardrails existentes é exibida com título, indicador de escopo (global/específico) e ações disponíveis (editar, excluir).
2. **Given** que o administrador aciona "Novo Guardrail", **When** o formulário é aberto, **Then** os campos "Título", "Conteúdo" (editor Markdown) e o toggle "Global" são apresentados com validação de obrigatoriedade.
3. **Given** que os campos obrigatórios estão preenchidos, **When** o administrador confirma a criação, **Then** o guardrail é criado via API, a listagem é atualizada e o feedback "Guardrail criado com sucesso" é exibido.
4. **Given** que um guardrail existe na listagem, **When** o administrador aciona "Editar", **Then** o formulário é pré-preenchido com os valores atuais e permite alteração e salvamento.
5. **Given** que um guardrail existe na listagem, **When** o administrador aciona "Excluir", **Then** um diálogo de confirmação é exibido com o título do guardrail, e ao confirmar o item é removido da listagem com feedback "Guardrail excluído com sucesso".
6. **Given** que ocorre falha na API durante qualquer operação, **When** o erro é recebido, **Then** o formulário ou listagem permanece no estado atual e o feedback de erro é exibido.

---

### User Story 2 - Gerenciar Prompts Base (Priority: P2)

Como administrador autenticado, quero listar, criar, editar e excluir modelos de prompts do sistema, vinculando múltiplos guardrails a cada prompt, para compor comportamentos controlados para a IA.

**Why this priority**: Prompts são o conteúdo principal que a IA utiliza, e dependem dos guardrails já cadastrados para funcionar. Esta história depende da existência de guardrails (P1), mas entrega o valor central de configurar o comportamento da IA.

**Independent Test**: Pode ser testado acessando a aba "Prompts Base", visualizando a listagem de prompts com seus guardrails associados, criando um novo prompt selecionando múltiplos guardrails, editando o conteúdo Markdown e excluindo com confirmação.

**Acceptance Scenarios**:

1. **Given** que um administrador autenticado acessa a aba "Prompts Base", **When** a página carrega, **Then** a listagem de prompts é exibida com título, indicador de padrão (default), guardrails vinculados e ações (editar, excluir).
2. **Given** que o administrador aciona "Novo Prompt", **When** o formulário é aberto, **Then** os campos "Título", "Conteúdo" (editor Markdown), toggle "Padrão" e o seletor multi-checkbox de guardrails disponíveis são apresentados.
3. **Given** que existem guardrails cadastrados, **When** o administrador visualiza o seletor N:N, **Then** todos os guardrails disponíveis são listados com checkboxes para seleção múltipla.
4. **Given** que os campos obrigatórios estão preenchidos, **When** o administrador confirma a criação, **Then** o prompt é criado com os guardrails selecionados, a listagem é atualizada e o feedback "Prompt criado com sucesso" é exibido.
5. **Given** que um prompt existe na listagem, **When** o administrador aciona "Editar", **Then** o formulário é pré-preenchido com valores atuais e guardrails já selecionados, permitindo alteração da seleção N:N.
6. **Given** que um prompt existe, **When** o administrador aciona "Excluir", **Then** um diálogo de confirmação é exibido com o título do prompt, e ao confirmar o item é removido com feedback apropriado.
7. **Given** que o conteúdo Markdown do prompt é editado, **When** o administrador alterna para o modo preview, **Then** o conteúdo é renderizado em tempo real como HTML formatado.

---

### User Story 3 - Vincular Tenant a Prompt (Priority: P3)

Como administrador autenticado, quero associar um tenant a um prompt específico, com a opção de fornecer uma customização de conteúdo (override), para que diferentes organizações possam ter comportamentos de IA personalizados.

**Why this priority**: O vínculo tenant-prompt permite personalização por organização, mas depende da existência de prompts (P2) e tenants já cadastrados. É uma funcionalidade de configuração avançada.

**Independent Test**: Pode ser testado acessando a aba "Vincular Tenant", selecionando um tenant, escolhendo um prompt da lista e opcionalmente preenchendo conteúdo customizado, confirmando a associação com feedback de sucesso.

**Acceptance Scenarios**:

1. **Given** que o administrador acessa a aba "Vincular Tenant", **When** a página carrega, **Then** o formulário exibe campo para `tenant_id`, seletor de `prompt_id` com a lista de prompts disponíveis e campo opcional para `custom_content_override` com editor Markdown.
2. **Given** que `tenant_id` e `prompt_id` são informados, **When** o administrador confirma o vínculo, **Then** a associação é criada via API e o feedback "Vínculo criado com sucesso" é exibido.
3. **Given** que um `custom_content_override` é fornecido, **When** o vínculo é criado, **Then** o conteúdo customizado é enviado junto com a associação.
4. **Given** que `tenant_id` ou `prompt_id` não são informados, **When** o administrador tenta confirmar, **Then** a validação bloqueia o envio e exibe mensagens de obrigatoriedade.
5. **Given** que ocorre falha na API, **When** o erro é recebido, **Then** o formulário permanece preenchido e o feedback de erro é exibido.

---

### Fluxo do Usuário

1. O administrador autentica-se e acessa a área administrativa.
2. A navegação administrativa exibe "Prompts & Guardrails"; o administrador acessa `/admin/prompt-manager`.
3. Na aba "Guardrails", visualiza a listagem e pode criar, editar ou excluir guardrails.
4. Na aba "Prompts Base", visualiza a listagem e pode criar prompts vinculando guardrails existentes via seleção múltipla.
5. Na aba "Vincular Tenant", associa um tenant a um prompt com possível override de conteúdo.
6. Em qualquer aba, pode abrir o editor Markdown e alternar entre modos de edição, preview e split.
7. Em caso de falha, permanece no contexto atual com feedback e dados preservados.

### Edge Cases

- Administrador tenta criar um prompt sem nenhum guardrail selecionado (lista vazia ou nenhum checkbox marcado).
- Administrador tenta excluir um guardrail que está vinculado a um ou mais prompts ativos.
- Conteúdo Markdown contém caracteres especiais, scripts embutidos ou marcação inválida.
- O editor Markdown recebe conteúdo muito extenso (ex: >100KB de texto).
- A API retorna erro de validação com mensagens por campo (ex: título duplicado, conteúdo inválido).
- A listagem de guardrails ou prompts está vazia (primeiro acesso, nenhum cadastro).
- O administrador alterna rapidamente entre abas durante uma operação pendente.
- Respostas atrasadas ou obsoletas de operações anteriores que poderiam sobrescrever o estado atual.
- A lista de prompts no seletor da aba "Vincular Tenant" está vazia.
- O `tenant_id` informado não existe ou já está vinculado ao mesmo prompt.

## Requirements *(mandatory)*

### Functional Requirements

**Acesso e Navegação**

- **FR-001**: A navegação administrativa DEVE exibir o item "Prompts & Guardrails" com ícone coerente, visível apenas a administradores autenticados, apontando para `/admin/prompt-manager`.
- **FR-002**: A página `/admin/prompt-manager` DEVE verificar autorização administrativa antes de renderizar qualquer conteúdo.

**Estrutura de Abas**

- **FR-003**: A página DEVE organizar o conteúdo em três abas (Tabs): "Prompts Base", "Guardrails" e "Vincular Tenant".
- **FR-004**: A primeira aba acessada DEVE ser "Prompts Base" como padrão.
- **FR-005**: A troca entre abas NÃO DEVE perder o estado ou formulários não salvos da aba anterior, preservando dados preenchidos.

**CRUD de Guardrails**

- **FR-006**: O sistema DEVE listar todos os guardrails existentes consumindo `GET /prompt-manager/guardrails`.
- **FR-007**: O sistema DEVE exibir cada guardrail com título, indicador de escopo (Global/Específico) e ações "Editar" e "Excluir".
- **FR-008**: O sistema DEVE permitir criar um guardrail via formulário com campos `titulo` (obrigatório), `conteudo` (obrigatório, editor Markdown) e `is_global` (toggle booleano).
- **FR-009**: A criação de guardrail DEVE chamar `POST /prompt-manager/guardrails` com o corpo `{ titulo, conteudo, is_global }`.
- **FR-010**: O sistema DEVE permitir editar um guardrail existente, pré-preenchendo o formulário com os valores atuais.
- **FR-011**: A edição de guardrail DEVE chamar `PUT /prompt-manager/guardrails/{id}`.
- **FR-012**: O sistema DEVE permitir excluir um guardrail após confirmação explícita em diálogo que exibe o título do item.
- **FR-013**: A exclusão de guardrail DEVE chamar `DELETE /prompt-manager/guardrails/{id}`.

**CRUD de Prompts**

- **FR-014**: O sistema DEVE listar todos os prompts existentes consumindo `GET /prompt-manager/prompts`.
- **FR-015**: O sistema DEVE exibir cada prompt com título, indicador de padrão (default), lista de guardrails vinculados e ações "Editar" e "Excluir".
- **FR-016**: O sistema DEVE permitir criar um prompt via formulário com campos `titulo` (obrigatório), `conteudo` (obrigatório, editor Markdown), `is_default` (toggle booleano) e seletor N:N de `guardrail_ids`.
- **FR-017**: A criação de prompt DEVE chamar `POST /prompt-manager/prompts` com o corpo `{ titulo, conteudo, is_default, guardrail_ids }`.
- **FR-018**: O seletor de guardrails DEVE carregar a lista de guardrails disponíveis via `GET /prompt-manager/guardrails` e apresentá-los como checkboxes para seleção múltipla.
- **FR-019**: O sistema DEVE permitir editar um prompt existente, pré-preenchendo formulário e seleção de guardrails.
- **FR-020**: A edição de prompt DEVE chamar `PUT /prompt-manager/prompts/{id}`.
- **FR-021**: O sistema DEVE permitir excluir um prompt após confirmação explícita em diálogo que exibe o título do item.
- **FR-022**: A exclusão de prompt DEVE chamar `DELETE /prompt-manager/prompts/{id}`.

**Editor Markdown**

- **FR-023**: O editor Markdown DEVE oferecer três modos de visualização: "Edição" (código Markdown), "Visualização" (preview renderizado) e "Lado a Lado" (split com edição e preview simultâneos).
- **FR-024**: O preview Markdown DEVE ser atualizado em tempo real conforme o conteúdo é editado.
- **FR-025**: O preview DEVE sanitizar conteúdo para prevenir injeção de scripts (XSS), não renderizando HTML arbitrário ou scripts embutidos.

**Vínculo Tenant-Prompt**

- **FR-026**: O sistema DEVE permitir associar um tenant a um prompt via formulário com campos `tenant_id` (obrigatório, texto), `prompt_id` (obrigatório, seletor) e `custom_content_override` (opcional, editor Markdown).
- **FR-027**: O seletor de `prompt_id` DEVE carregar a lista de prompts disponíveis via `GET /prompt-manager/prompts`.
- **FR-028**: A associação DEVE chamar `POST /prompt-manager/link-tenant` com o corpo `{ tenant_id, prompt_id, custom_content_override? }`.

**Validação e Feedback**

- **FR-029**: Todo formulário DEVE validar campos obrigatórios (`titulo`, `conteudo`) antes do envio, exibindo mensagens de erro junto aos campos correspondentes.
- **FR-030**: Campos de texto DEVEM ter valores normalizados (trim de espaços) antes da validação e envio.
- **FR-031**: O sistema DEVE bloquear envios duplicados exibindo estado de carregamento no botão de ação durante operações pendentes.
- **FR-032**: Em sucesso de qualquer operação (HTTP 200/201), o sistema DEVE exibir notificação toast com mensagem específica da operação realizada.
- **FR-033**: Em falha de API (HTTP 4xx/5xx), o sistema DEVE exibir notificação toast com mensagem de erro descritiva.
- **FR-034**: Em falha de rede ou timeout, o sistema DEVE exibir mensagem "Não foi possível conectar ao servidor. Verifique sua conexão.".
- **FR-035**: Erros de validação por campo retornados pela API DEVEM ser apresentados junto aos campos correspondentes no formulário.
- **FR-036**: Após criação bem-sucedida, o formulário DEVE ser fechado e a listagem DEVE ser atualizada sem recarregar a página inteira.
- **FR-037**: Após edição bem-sucedida, o formulário DEVE ser fechado e o item na listagem DEVE refletir os novos valores.
- **FR-038**: Após exclusão bem-sucedida, o item DEVE ser removido da listagem sem recarregar a página inteira.

**Acessibilidade e Responsividade**

- **FR-039**: Todos os campos DEVEM ter labels associadas; erros e notificações DEVEM ser anunciados por tecnologia assistiva.
- **FR-040**: Todos os controles interativos DEVEM ser operáveis por teclado.
- **FR-041**: O layout DEVE ser responsivo, permanecendo utilizável sem sobreposição ou transbordamento nas larguras desktop e mobile suportadas.

**Componentização**

- **FR-042**: Os componentes da tela DEVEM ser organizados em módulos isolados e reutilizáveis: `PromptList`, `PromptFormModal`, `GuardrailList`, `GuardrailFormModal`, `TenantLinkSection`, `MarkdownEditorCustom`.
- **FR-043**: As tipagens TypeScript DEVEM ser organizadas em: `src/services/promptManager.types.ts` (tipos de API Request/Response), `src/lib/promptManagerSchemas.ts` (schemas Zod + tipos inferidos) e `src/components/admin/prompt-manager/types.ts` (tipos locais de componentes), seguindo o princípio de responsabilidade única (SRP).
- **FR-044**: Chamadas de API DEVEM ser centralizadas em uma camada de serviço, sem requisições HTTP diretas nos componentes visuais.
- **FR-045**: O sistema NÃO DEVE registrar em logs os valores de conteúdo de prompts, guardrails ou overrides.

### Key Entities

- **Guardrail**: Regra de segurança/comportamento com `id`, `titulo`, `conteudo` (Markdown), `is_global` (boolean). Pode estar vinculado a N prompts.
- **Prompt**: Modelo de prompt do sistema com `id`, `titulo`, `conteudo` (Markdown), `is_default` (boolean). Possui N guardrails vinculados. Pode estar associado a N tenants.
- **Associação Prompt-Guardrail**: Relacionamento N:N entre prompts e guardrails, representado pelo array `guardrail_ids` no prompt.
- **Vínculo Tenant-Prompt**: Associação entre um tenant e um prompt, com `tenant_id`, `prompt_id` e `custom_content_override` opcional (Markdown) para personalização por organização.

### Estrutura de Componentes e Responsabilidades

- **Página de Prompt Manager (`/admin/prompt-manager`)**: verifica autorização, renderiza o layout de abas e coordena o estado global da tela.
- **PromptList**: exibe listagem de prompts com informações resumidas e ações; gerencia estado de carregamento e lista vazia.
- **PromptFormModal**: modal com formulário de criação/edição de prompt, incluindo seletor N:N de guardrails e editor Markdown.
- **GuardrailList**: exibe listagem de guardrails com informações resumidas e ações; gerencia estado de carregamento e lista vazia.
- **GuardrailFormModal**: modal com formulário de criação/edição de guardrail, incluindo editor Markdown e toggle `is_global`.
- **TenantLinkSection**: formulário para vincular tenant a prompt, com campo de texto para `tenant_id`, seletor de prompt e editor Markdown opcional para override.
- **MarkdownEditorCustom**: editor Markdown com três modos (edição, preview, split), integrado com sanitização de saída.
- **Camada de serviço (`promptManagerService`)**: centraliza chamadas HTTP, serialização, interpretação de respostas e normalização de erros.
- **Notificação (Toast)**: anuncia sucesso e falhas de operações de forma não intrusiva.

### Contratos da API

| Operação | Método e rota | Entrada | Resultado esperado |
|---|---|---|---|
| Listar guardrails | `GET /prompt-manager/guardrails` | — | Array de guardrails |
| Criar guardrail | `POST /prompt-manager/guardrails` | `{ titulo, conteudo, is_global }` | Guardrail criado ou erro |
| Editar guardrail | `PUT /prompt-manager/guardrails/{id}` | `{ titulo, conteudo, is_global }` | Guardrail atualizado ou erro |
| Excluir guardrail | `DELETE /prompt-manager/guardrails/{id}` | ID no caminho | Confirmação ou erro |
| Listar prompts | `GET /prompt-manager/prompts` | — | Array de prompts com guardrails |
| Criar prompt | `POST /prompt-manager/prompts` | `{ titulo, conteudo, is_default, guardrail_ids }` | Prompt criado ou erro |
| Editar prompt | `PUT /prompt-manager/prompts/{id}` | `{ titulo, conteudo, is_default, guardrail_ids }` | Prompt atualizado ou erro |
| Excluir prompt | `DELETE /prompt-manager/prompts/{id}` | ID no caminho | Confirmação ou erro |
| Vincular tenant | `POST /prompt-manager/link-tenant` | `{ tenant_id, prompt_id, custom_content_override? }` | Vínculo criado ou erro |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administradores conseguem criar um guardrail completo (título + conteúdo) em até 2 minutos.
- **SC-002**: Administradores conseguem criar um prompt com seleção de guardrails vinculados em até 3 minutos.
- **SC-003**: A troca entre modos do editor Markdown (edição/preview/split) ocorre em menos de 500ms.
- **SC-004**: O feedback visual (toast) de sucesso ou erro é exibido em até 1 segundo após a resposta da API.
- **SC-005**: 100% das operações de CRUD exibem feedback apropriado (sucesso ou erro) — nenhuma operação silenciosa.
- **SC-006**: A interface permanece responsiva e utilizável em viewports a partir de 375px de largura (mobile).
- **SC-007**: 90% dos administradores conseguem completar o fluxo de vinculação tenant-prompt na primeira tentativa, sem necessitar de suporte adicional.
- **SC-008**: Nenhum conteúdo Markdown malicioso (scripts, HTML arbitrário) é executado no preview — 100% de sanitização.

## Assumptions

- As rotas `PUT /prompt-manager/guardrails/{id}`, `DELETE /prompt-manager/guardrails/{id}`, `PUT /prompt-manager/prompts/{id}` e `DELETE /prompt-manager/prompts/{id}` existirão no backend seguindo convenção REST. Caso não existam no momento da implementação, as funcionalidades de edição e exclusão serão desenvolvidas com a camada de serviço preparada, e os botões poderão ser ocultados até que os endpoints estejam disponíveis.
- O endpoint `GET /prompt-manager/guardrails` retorna todos os guardrails com `id`, `titulo`, `conteudo`, `is_global`.
- O endpoint `GET /prompt-manager/prompts` retorna todos os prompts com `id`, `titulo`, `conteudo`, `is_default` e o array de guardrails vinculados (`guardrail_ids` e/ou objetos completos).
- A autenticação e autorização administrativa já existem no sistema (mecanismo de middleware ou guard de rota) e serão reutilizadas.
- O sistema de notificações toast (`sonner`) já está disponível no projeto ou será adicionado como dependência.
- A biblioteca de componentes base (shadcn/ui ou similar) já está disponível para Tabs, Modal/Dialog, Checkbox, Button, Input, etc.
- A biblioteca `react-markdown` com plugin de sanitização (`rehype-sanitize`) será utilizada para o preview Markdown.
- Testes unitários estão fora do escopo desta entrega.
- O idioma da interface administrativa é Português (Brasil).
- O seletor de `tenant_id` na aba "Vincular Tenant" será um campo de texto livre, pois o endpoint de listagem de tenants pode não estar disponível no momento da implementação.
