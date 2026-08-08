# Feature Specification: Conexão de Instâncias WhatsApp

**Feature Branch**: `Edilson-31-Dev`  
**Created**: 2026-08-08  
**Status**: Draft  
**Input**: User description: "Adicionar ao módulo administrador o cadastro de instâncias WhatsApp para tenants existentes, com carregamento, exibição do QR Code em página dedicada e opção de reconectar ou rever o QR Code por meio da API Python."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar instância e conectar WhatsApp (Priority: P1)

Como administrador autenticado, quero cadastrar uma instância de WhatsApp para um tenant existente e visualizar o QR Code gerado, para conectar a conta do cliente sem usar ferramentas externas.

**Why this priority**: O cadastro e a primeira conexão formam o fluxo principal da feature e entregam valor mesmo sem as opções posteriores de recuperação.

**Independent Test**: Pode ser testado informando um tenant válido e um nome de instância ainda não utilizado, enviando o cadastro e confirmando que a página dedicada exibe o QR Code correspondente.

**Acceptance Scenarios**:

1. **Given** que o administrador está autenticado e acessa o módulo de WhatsApp, **When** a tela carrega, **Then** ele visualiza campos para identificar o tenant e nomear a instância, além da ação para cadastrar e gerar o QR Code.
2. **Given** que o administrador informou um tenant existente e um nome de instância válido, **When** confirma o cadastro, **Then** o sistema solicita a criação ao serviço oficial de backend e exibe um indicador de carregamento que impede envios duplicados até a conclusão.
3. **Given** que o serviço oficial confirma a criação e fornece o QR Code, **When** a resposta é recebida, **Then** o administrador é direcionado para uma página dedicada que identifica a instância e exibe a imagem pronta para escaneamento.
4. **Given** que o serviço oficial rejeita o tenant, o nome da instância ou o cadastro, **When** a resposta de erro é recebida, **Then** o sistema permanece no formulário, apresenta uma mensagem compreensível e permite corrigir os dados e tentar novamente.

---

### User Story 2 - Rever ou recuperar QR Code (Priority: P2)

Como administrador, quero usar a ação "Reconectar / Ver QR Code" para recuperar o código de uma instância existente quando a tela anterior foi fechada ou o código não foi escaneado a tempo.

**Why this priority**: A recuperação evita cadastros duplicados e reduz suporte operacional quando a primeira tentativa de conexão é interrompida.

**Independent Test**: Pode ser testado informando ou selecionando uma instância existente, acionando "Reconectar / Ver QR Code" e confirmando a exibição do QR Code atualizado na página dedicada.

**Acceptance Scenarios**:

1. **Given** que existe uma instância cadastrada, **When** o administrador aciona "Reconectar / Ver QR Code", **Then** o sistema solicita ao serviço oficial de backend o QR Code atual dessa instância e apresenta loading durante a consulta.
2. **Given** que o serviço oficial retorna o QR Code da instância, **When** a consulta termina, **Then** o sistema abre a página dedicada com a imagem e o nome da instância consultada.
3. **Given** que a instância não existe, está indisponível ou não possui QR Code recuperável, **When** a consulta termina, **Then** o sistema informa o motivo disponível, mantém os dados informados e permite nova tentativa.

---

### User Story 3 - Escanear QR Code com segurança operacional (Priority: P3)

Como administrador, quero que a tela de QR Code apresente claramente o estado da solicitação e a instância associada, para evitar conectar o WhatsApp ao cliente errado.

**Why this priority**: A identificação e os estados visuais reduzem erros operacionais em um ambiente com múltiplos tenants, embora dependam dos fluxos principais de geração ou recuperação.

**Independent Test**: Pode ser testado acessando a página de QR Code durante carregamento, sucesso e falha, verificando que cada estado é distinguível e que o nome da instância aparece no sucesso.

**Acceptance Scenarios**:

1. **Given** que o QR Code ainda está sendo solicitado, **When** a página dedicada é exibida, **Then** o administrador vê um estado de carregamento e não vê uma imagem quebrada ou um código anterior.
2. **Given** que o QR Code foi carregado, **When** o administrador visualiza a página, **Then** a imagem é exibida integralmente, com contraste e dimensões adequadas para escaneamento em desktop e mobile.
3. **Given** que não há QR Code válido para exibir, **When** a página é acessada ou a solicitação falha, **Then** o administrador vê uma mensagem de erro e uma ação para retornar ou tentar novamente.
4. **Given** que o QR Code foi carregado, **When** o administrador consulta as instruções, **Then** ele vê a sequência para abrir o WhatsApp, acessar "Aparelhos Conectados" > "Conectar um aparelho" e apontar a câmera para a tela.
5. **Given** que o administrador concluiu ou deseja encerrar o fluxo, **When** aciona "Concluído / Fechar", **Then** o sistema descarta o QR Code exibido e retorna ao módulo de WhatsApp.

### Edge Cases

- O tenant informado não existe ou não está habilitado para receber uma instância de WhatsApp.
- O nome de instância está vazio, contém formato inválido ou já pertence a outra instância.
- O administrador clica repetidamente na ação enquanto a solicitação ainda está em andamento.
- O serviço oficial de backend está indisponível, demora além do limite esperado ou devolve uma resposta sem QR Code válido.
- O conteúdo recebido não representa uma imagem de QR Code válida; a interface não deve tentar exibir conteúdo inseguro ou uma imagem quebrada.
- O QR Code expira entre a exibição e o escaneamento; o administrador deve conseguir solicitar outro pela ação de reconexão.
- O administrador fecha ou recarrega a página de QR Code antes de escanear; a instância não deve ser cadastrada novamente para recuperar o código.
- Uma resposta atrasada de uma solicitação anterior não deve substituir o resultado da solicitação mais recente.
- A página é usada em uma tela pequena; identificação, QR Code e ações devem permanecer visíveis sem sobreposição.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar no painel administrativo autenticado um módulo para conexão de instâncias WhatsApp.
- **FR-002**: O módulo DEVE permitir informar o identificador de um tenant existente e um nome de instância para um novo cadastro.
- **FR-003**: O sistema DEVE validar que tenant e nome da instância contêm texto após a remoção de espaços nas extremidades antes de solicitar o cadastro; a validação de existência e disponibilidade permanece sob responsabilidade do serviço oficial.
- **FR-004**: O sistema DEVE enviar os dados de cadastro exclusivamente para o serviço oficial de backend; o navegador NÃO DEVE se comunicar diretamente com o provedor de WhatsApp.
- **FR-005**: Durante a criação ou recuperação de QR Code, o sistema DEVE exibir um estado de carregamento, desabilitar a ação em andamento e impedir solicitações duplicadas.
- **FR-006**: Quando a criação for confirmada, o sistema DEVE associar a resposta ao tenant e ao nome de instância solicitados e disponibilizar o QR Code retornado para visualização.
- **FR-007**: O sistema DEVE disponibilizar uma página dedicada para exibir o QR Code de conexão e identificar claramente a instância à qual ele pertence.
- **FR-008**: A página de QR Code DEVE exibir a imagem completa em tamanho adequado para escaneamento e adaptar-se a telas desktop e mobile.
- **FR-009**: O módulo DEVE disponibilizar a ação "Reconectar / Ver QR Code" para uma instância já cadastrada.
- **FR-010**: Ao acionar a reconexão, o sistema DEVE solicitar exclusivamente ao serviço oficial de backend o QR Code atual da instância informada.
- **FR-011**: O sistema DEVE substituir qualquer QR Code anterior somente após receber uma nova resposta válida para a solicitação atual.
- **FR-012**: O sistema DEVE rejeitar conteúdo de QR Code ausente, malformado ou que não represente uma imagem PNG válida, apresentando erro em vez de imagem quebrada.
- **FR-013**: Falhas de validação, conexão, indisponibilidade, expiração ou respostas rejeitadas DEVEM produzir mensagens compreensíveis e permitir correção ou nova tentativa.
- **FR-014**: Em caso de falha, o sistema DEVE preservar os identificadores informados pelo administrador sempre que isso não representar risco de exibir dados de outro tenant.
- **FR-015**: O sistema DEVE impedir que respostas atrasadas de solicitações anteriores sobrescrevam o estado da solicitação mais recente.
- **FR-016**: A página dedicada DEVE oferecer uma ação clara para retornar ao módulo administrativo e, quando aplicável, solicitar novamente o QR Code.
- **FR-017**: O fluxo de WhatsApp DEVE manter o controle de acesso já aplicado ao painel administrativo e não deve tornar o QR Code acessível fora de uma sessão administrativa autorizada.
- **FR-018**: A página de QR Code DEVE apresentar instruções numeradas para abrir o WhatsApp do cliente, acessar "Aparelhos Conectados" > "Conectar um aparelho" e apontar a câmera para a tela.
- **FR-019**: A página de QR Code DEVE disponibilizar o botão "Concluído / Fechar", que descarta o QR Code em memória e retorna ao módulo de WhatsApp.

### External Dependencies

- **Criação de instância**: O serviço oficial de backend deve aceitar a identificação do tenant e o nome da instância e, em caso de sucesso, fornecer a confirmação, os mesmos identificadores e a imagem do QR Code.
- **Recuperação de QR Code**: O serviço oficial de backend deve localizar uma instância existente pelo nome e, em caso de sucesso, fornecer sua identificação e uma imagem de QR Code atualizada.
- **Limite de integração**: Qualquer comunicação com o provedor de WhatsApp é responsabilidade exclusiva do serviço oficial de backend.

### Key Entities

- **Tenant**: Cliente já existente ao qual a instância será vinculada; identificado por `tenant_id`.
- **WhatsAppInstance**: Representa a conexão de WhatsApp de um tenant; possui `instance_name`, vínculo com um tenant e estado de conexão observável pelo fluxo administrativo.
- **ConnectionQrCode**: Imagem temporária usada para conectar uma instância; associada a uma única instância e sujeita a atualização ou expiração.
- **ConnectionRequestState**: Estado observável de uma solicitação de criação ou recuperação, incluindo operação em andamento, sucesso e falha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 95% dos administradores em teste conseguem cadastrar uma instância válida e chegar ao QR Code sem documentação externa na primeira tentativa.
- **SC-002**: Em condições normais, o estado de carregamento aparece em até 300 milissegundos após a ação e permanece visível até que haja sucesso ou falha.
- **SC-003**: Pelo menos 95% das solicitações bem-sucedidas exibem um QR Code pronto para escaneamento em até 5 segundos após a confirmação do administrador, desconsiderando indisponibilidade do serviço externo.
- **SC-004**: 100% dos testes de criação e recuperação confirmam que o navegador se comunica apenas com o serviço oficial de backend e nunca diretamente com o provedor de WhatsApp.
- **SC-005**: 100% dos cenários testados de erro exibem feedback compreensível, não apresentam imagem quebrada e permitem retornar ou tentar novamente.
- **SC-006**: Em testes responsivos, o QR Code pode ser escaneado com sucesso em 95% das tentativas nas larguras móveis e desktop suportadas pelo produto.
- **SC-007**: Um administrador consegue recuperar o QR Code de uma instância existente em até 30 segundos, sem cadastrar uma nova instância.

## Assumptions

- O tenant já foi cadastrado por outro fluxo; criação e manutenção de tenants estão fora do escopo desta feature.
- O serviço oficial de backend disponibiliza as operações de criação e recuperação descritas e é responsável por toda comunicação com o provedor de WhatsApp.
- O endereço do serviço oficial já faz parte da configuração existente do ambiente e pode variar entre ambientes de operação.
- O QR Code retornado é temporário e pode expirar; solicitar um novo código não cria uma nova instância.
- O painel administrativo e seu mecanismo atual de autenticação serão reutilizados; gestão de usuários, perfis e permissões adicionais está fora do escopo.
- A listagem automática de todas as instâncias e a atualização contínua do status de conexão ficam fora desta entrega; a recuperação usa o nome da instância conhecido pelo administrador.
- Exclusão, alteração de nome e transferência de instância entre tenants não fazem parte desta feature.
