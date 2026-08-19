# Feature Specification: Widget de Chat Embutível para Clientes

**Feature Branch**: `016-embeddable-chat-widget`
**Created**: 2026-08-19
**Status**: Draft
**Input**: User description: "vamos criar uma especificação para que seja facil para qualquer cliente colocar o widget do chat no portal dele, não necessitando que eu preciso entrar no codigo dele, mas q eu possa enviar um script ou algo que vc sugere para podermos vendar o chat com ia para N clientes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operador gera o snippet de instalação do cliente (Priority: P1)

Depois de cadastrar um novo tenant (cliente) e concluir a ingestão da base de conhecimento dele, o operador (Interasis) precisa obter um trecho de código pronto, exclusivo daquele cliente, para entregar a ele.

**Why this priority**: Sem essa etapa não existe nada para entregar ao cliente — é o ponto de partida de toda a venda do widget.

**Independent Test**: Pode ser testado cadastrando um tenant já existente e verificando que o sistema produz um snippet de instalação único e pronto para uso, sem exigir preenchimento manual de identificadores.

**Acceptance Scenarios**:

1. **Given** um tenant já cadastrado com domínios autorizados definidos, **When** o operador solicita o snippet de instalação para esse tenant, **Then** o sistema fornece um trecho de código pronto para colar, já identificando aquele tenant especificamente.
2. **Given** dois tenants diferentes cadastrados, **When** o operador gera o snippet de cada um, **Then** os snippets são diferentes entre si e cada um só funciona para o tenant correspondente.

---

### User Story 2 - Cliente instala o widget colando um único trecho de código (Priority: P1)

O cliente recebe o snippet do operador e precisa colocá-lo em seu próprio site para que o chat apareça, sem precisar editar código, preencher configurações ou entender detalhes técnicos.

**Why this priority**: É a promessa central do produto — "não precisar entrar no código do cliente" só funciona se a instalação for trivial o suficiente para qualquer cliente executar sozinho.

**Independent Test**: Pode ser testado colando o snippet recebido em uma página HTML de teste e verificando que o widget aparece funcional, sem nenhuma edição do trecho recebido.

**Acceptance Scenarios**:

1. **Given** um cliente recebeu o snippet gerado para o tenant dele, **When** ele cola o trecho em seu site sem modificá-lo, **Then** o widget de chat aparece funcional no site, pronto para conversar com visitantes.
2. **Given** o snippet já colado em uma página do site, **When** o cliente publica o mesmo snippet em outras páginas do mesmo site, **Then** o widget funciona da mesma forma em todas elas, sem exigir ajustes por página.

---

### User Story 3 - Visitante conversa com o assistente de IA do cliente (Priority: P2)

Um visitante do site do cliente abre o widget e conversa com o assistente, recebendo respostas baseadas na base de conhecimento daquele cliente específico.

**Why this priority**: É o valor final entregue ao cliente pagante — sem essa interação funcionando, o widget instalado não tem utilidade.

**Independent Test**: Pode ser testado abrindo o widget em um site com o snippet instalado, enviando uma mensagem e confirmando que a resposta reflete o conhecimento e a identidade daquele tenant.

**Acceptance Scenarios**:

1. **Given** o widget está instalado e funcional em um domínio autorizado, **When** um visitante envia uma mensagem pelo widget, **Then** ele recebe uma resposta gerada pela IA usando a base de conhecimento cadastrada para aquele tenant.
2. **Given** um visitante já trocou mensagens no widget, **When** ele navega para outra página do mesmo site (com o mesmo snippet instalado), **Then** o histórico da conversa em andamento é preservado.

---

### User Story 4 - Sistema bloqueia uso do widget fora dos domínios autorizados (Priority: P2)

Caso o snippet de um cliente seja copiado e colado em um site não autorizado, o widget não deve funcionar naquele domínio.

**Why this priority**: Protege o modelo de negócio (cobrança por cliente) e evita que um snippet vendido a um cliente seja reaproveitado indevidamente em outro site.

**Independent Test**: Pode ser testado colando um snippet válido em um domínio que não está na lista de domínios autorizados daquele tenant e confirmando que o widget não fica funcional.

**Acceptance Scenarios**:

1. **Given** um snippet válido de um tenant, **When** ele é carregado em um domínio que não está na lista de domínios autorizados desse tenant, **Then** o widget não se torna funcional para os visitantes daquele domínio, e nenhum detalhe técnico do erro é exposto na página.
2. **Given** um domínio anteriormente autorizado é removido da lista de domínios de um tenant, **When** um visitante acessa o site novamente, **Then** o widget deixa de funcionar naquele domínio.

---

### User Story 5 - Operador atualiza a aparência básica do widget sem nova instalação (Priority: P3)

O operador precisa poder ajustar cor, logo, mensagem de saudação e posição do widget de um cliente já instalado, sem pedir para o cliente trocar o snippet novamente.

**Why this priority**: Reduz o atrito operacional de manutenção e evita depender do cliente para pequenos ajustes de marca, mas não bloqueia o lançamento inicial do produto.

**Independent Test**: Pode ser testado alterando a configuração de aparência de um tenant já com widget instalado e confirmando que a mudança aparece no site do cliente sem que o snippet seja tocado.

**Acceptance Scenarios**:

1. **Given** um tenant com widget já instalado no site do cliente, **When** o operador atualiza a cor principal, o logo, a saudação ou a posição na tela desse tenant, **Then** o widget no site do cliente passa a refletir a nova aparência sem exigir qualquer ação do cliente.

---

### Edge Cases

- O que acontece quando o cliente instala o snippet antes da ingestão da base de conhecimento estar concluída? O widget deve aparecer normalmente, mas o assistente pode não ter contexto suficiente para responder — comportamento aceitável nesta fase, sem tratamento especial.
- O que acontece se o cliente remover ou danificar o trecho de código colado? O widget simplesmente deixa de aparecer; nenhuma ação automática é esperada do sistema.
- O que acontece se o mesmo snippet for colado em múltiplos domínios diferentes por engano? O widget só se torna funcional nos domínios que estiverem na lista de domínios autorizados daquele tenant; os demais não exibem chat funcional.
- O que acontece quando um tenant é desativado ou excluído pelo operador? O widget correspondente deixa de funcionar em qualquer site onde estiver instalado.
- O que acontece se o site do cliente tiver políticas de segurança que bloqueiam o carregamento de scripts externos (ex.: Content Security Policy restritiva)? O widget não carrega; tratado como limitação conhecida, fora do escopo de contorno automático nesta fase.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que o operador gere, para cada tenant já cadastrado, um snippet de instalação único e pronto para uso, sem exigir preenchimento manual de identificadores por parte do cliente.
- **FR-002**: O snippet de instalação MUST exigir do cliente apenas a inserção de um único trecho de código em seu site, sem etapas adicionais de configuração (sem preencher chaves, IDs ou opções manualmente).
- **FR-003**: O widget MUST só se tornar funcional em domínios explicitamente presentes na lista de domínios autorizados do tenant correspondente.
- **FR-004**: Quando carregado em um domínio não autorizado, o widget MUST permanecer não funcional para os visitantes, sem expor mensagens de erro técnico na página do cliente.
- **FR-005**: O widget MUST ser exibido como um elemento autocontido (bolha de chat) no site do cliente, sem ser afetado pelo CSS/JS do site hospedeiro nem interferir neles.
- **FR-006**: O widget MUST permitir que visitantes do site do cliente enviem mensagens e recebam respostas geradas por IA com base na base de conhecimento cadastrada especificamente para aquele tenant.
- **FR-007**: A aparência básica do widget (cor principal, logo, mensagem de saudação, posição na tela) MUST ser configurável pelo operador através do fluxo administrativo de tenants já existente, sem exigir que o cliente reinstale ou edite o snippet.
- **FR-008**: O mesmo snippet instalado MUST funcionar de forma idêntica em todas as páginas do site do cliente onde for colado (não é restrito a uma única página).
- **FR-009**: Quando um tenant for desativado ou excluído pelo operador, o widget correspondente MUST deixar de funcionar em qualquer site onde estiver instalado.
- **FR-010**: A instalação do widget pelo cliente MUST ser executável sem conhecimento técnico/de desenvolvimento além de colar um trecho de código em seu site.
- **FR-011**: O sistema MUST continuar utilizando o cadastro de tenant e a validação de domínios autorizados já existentes como base de identidade e segurança do widget, sem duplicar esse controle.

### Key Entities

- **Tenant** (já existente): representa um cliente/empresa contratante; passa a ser também a origem do snippet de instalação e da configuração de aparência do widget.
- **Snippet de Instalação**: trecho de código gerado por tenant, que referencia a identidade daquele cliente e é usado para carregar o widget em um site externo.
- **Conversa do Widget**: interação entre um visitante do site do cliente e o assistente de IA, delimitada à base de conhecimento daquele tenant.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um novo cliente consegue ter o widget funcionando em seu site apenas colando o snippet recebido, sem nenhuma edição de código de sua parte.
- **SC-002**: 100% das tentativas de carregar o widget em domínios não autorizados resultam em widget não funcional, sem exposição de erros técnicos.
- **SC-003**: O tempo entre o operador entregar o snippet e o widget estar visível e funcional no site do cliente é inferior a 10 minutos, assumindo que o cliente apenas cola o código fornecido.
- **SC-004**: Alterações de aparência básica feitas pelo operador (cor, logo, saudação, posição) passam a refletir no widget já instalado do cliente sem qualquer nova ação de instalação por parte dele.
- **SC-005**: O mesmo snippet funciona de forma idêntica em qualquer página do site do cliente em que for colado.

## Assumptions

- O provisionamento de cada cliente (cadastro do tenant e ingestão da base de conhecimento) continua sendo feito manualmente pelo operador (Interasis), fora do escopo desta especificação.
- A validação de domínios autorizados por tenant já é aplicada pela API de backend existente; esta feature depende dela, mas não a reimplementa.
- Controle de uso, limites de mensagens e cobrança por cliente ficam fora do escopo desta especificação e serão tratados em uma feature futura.
- A customização visual nesta fase cobre apenas cor principal, logo, mensagem de saudação e posição na tela — sem suporte a CSS customizado avançado ou reestruturação de layout.
- Não há, nesta fase, painel de autoatendimento para o cliente configurar o widget; toda configuração e entrega do snippet passam pelo operador.
- Presume-se que os sites dos clientes suportam o carregamento padrão de scripts externos; sites com políticas de segurança (CSP) muito restritivas são tratados como caso à parte, fora do escopo de contorno automático desta especificação.
