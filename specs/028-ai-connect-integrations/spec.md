# Feature Specification: InterasisAI Connect — Posicionamento de Integrações e Expansibilidade (Card e Página Saiba Mais)

**Feature Branch**: `028-ai-connect-integrations`  
**Created**: 2026-08-30  
**Status**: Draft  
**Input**: User description: "O produto Interasis AI Connect ele não é apenas um chat inteligente que realiza agendamentos, mas ele tb, com projeto de escopo fechado pode ser integrado a CRMs, Base de dados, APIs, e outras integrações, e a forma que apresentamos no card e no saiba mais nicha muito e deixa mais claro que ele funciona para agendamento, sim é o básico dele mas temos q mostrar o poder que ele tem. Dado que o produto é expansível à necessidade do cliente precisamos mostrar isto também no card e na pagina saiba mais. Mostrando uma animação de ligação entre o chat, agentes a N ambientes de API, Base Dados, MCP, Sistemas de RH e etc, mostrando animado aquelas setas para os produtos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - O card comunica que o produto vai além do agendamento (Priority: P1)

Um visitante da landing page (potencial cliente ou avaliador de negócio, não técnico) lê o card do InterasisAI Connect e entende que o produto não é apenas um chat inteligente que realiza agendamentos: é uma plataforma expansível que pode ser integrada a CRMs, bases de dados, APIs e outros sistemas, com expansão entregue sob medida via projeto de escopo fechado. O agendamento continua aparecendo como funcionalidade básica — não é removido nem desvalorizado.

**Why this priority**: É a correção central do posicionamento pedido. Sem essa mudança, o visitante continua enxergando "agendamento" como o produto inteiro, e todo o restante (página, animação) não tem a quem comunicar o novo posicionamento.

**Independent Test**: Abrir a landing page em cada um dos 3 idiomas (pt-BR, en, es) e ler apenas o card: o texto de posicionamento comunica integração e expansibilidade, sem depender da página Saiba mais ou de qualquer clique.

**Acceptance Scenarios**:

1. **Given** o card do InterasisAI Connect carregado, **When** o visitante lê o texto de impacto do card, **Then** encontra uma mensagem que comunica que o produto se integra a outros sistemas (CRM, base de dados, APIs e outros) e é expansível conforme a necessidade do cliente.
2. **Given** o card, **When** o visitante lê o conteúdo completo, **Then** o agendamento inteligente permanece mencionado como funcionalidade básica do produto, sem contradição com a mensagem de integração.
3. **Given** a landing page em pt-BR, en ou es, **When** o visitante lê o card, **Then** o mesmo posicionamento de integração/expansibilidade aparece no idioma acessado (apenas a marca "InterasisAI Connect" permanece sem tradução).

---

### User Story 2 - A página Saiba Mais apresenta a seção de integrações e expansibilidade (Priority: P1)

O visitante que clica em "Saiba mais" encontra, dentro da página de valor do produto, uma seção dedicada que mostra quais categorias de sistemas o InterasisAI Connect pode integrar (CRM, base de dados, APIs, MCP, sistemas de RH, entre outras) e explica que essa expansão é entregue como um projeto de escopo fechado, dimensionado à necessidade de cada cliente.

**Why this priority**: A página Saiba Mais é o mecanismo central de aprofundamento do produto; sem essa seção, o novo posicionamento fica restrito ao texto do card e o visitante que busca detalhes não encontra a capacidade de integração.

**Independent Test**: Navegar até a página Saiba Mais a partir do card (e também pela URL direta) e verificar a presença, a legibilidade e a tradução da seção de integrações, sem depender da animação funcionar.

**Acceptance Scenarios**:

1. **Given** a página Saiba Mais carregada, **When** o visitante percorre o conteúdo, **Then** encontra uma seção dedicada que lista as categorias de sistemas integráveis (CRM, base de dados, APIs, MCP, sistemas de RH, entre outras) em linguagem acessível ao público não técnico.
2. **Given** a seção de integrações, **When** o visitante lê o conteúdo, **Then** entende que a expansão é entregue como projeto de escopo fechado, adaptado à necessidade de cada cliente.
3. **Given** a página em pt-BR, en ou es, **When** o visitante acessa, **Then** todo o conteúdo da seção de integrações está no idioma acessado.
4. **Given** a página acessada diretamente pela URL (sem passar pela landing page), **When** ela carrega, **Then** a seção de integrações aparece normalmente junto com o restante do conteúdo existente.

---

### User Story 3 - Animação do processo de integração (Priority: P2)

Dentro da seção de integrações, uma visualização animada mostra o processo de conexão: um núcleo central (o chat e os agentes do InterasisAI Connect) conectado por setas animadas a nós que representam os ambientes integráveis (API, base de dados, MCP, sistemas de RH, entre outros). As setas fluem em loop contínuo, transmitindo a ideia de conexão ativa entre o produto e os sistemas do cliente.

**Why this priority**: É o elemento visual pedido que dá vida ao posicionamento, mas a mensagem de integração/expansibilidade já é entregue pelos textos do card e da seção, mesmo sem a animação.

**Independent Test**: Carregar a página Saiba Mais, observar a animação rodando em loop com setas fluindo do núcleo para os ambientes; ativar o modo de movimento reduzido (`prefers-reduced-motion`) e confirmar que o diagrama aparece estático com todos os rótulos legíveis.

**Acceptance Scenarios**:

1. **Given** a seção de integrações carregada, **When** o visitante observa o diagrama, **Then** setas animadas fluem continuamente do núcleo (chat e agentes) em direção aos nós de ambientes (API, base de dados, MCP, sistemas de RH), sem exigir nenhuma interação do usuário.
2. **Given** o visitante com preferência de movimento reduzido ativada, **When** a seção carrega, **Then** o diagrama aparece estático, com todos os rótulos (núcleo e ambientes) visíveis e legíveis.
3. **Given** a página aberta em um dispositivo móvel, **When** a seção carrega, **Then** o diagrama se reorganiza para a largura da tela, sem rolagem horizontal e com todos os rótulos legíveis.
4. **Given** a página com JavaScript desativado ou com falha de carregamento da animação, **When** o visitante acessa, **Then** o núcleo e os rótulos dos ambientes permanecem visíveis em formato estático (o conteúdo nunca fica vazio).

---

### Edge Cases

- O que acontece com usuários que ativam `prefers-reduced-motion`? O diagrama deve ser exibido em versão estática, com todos os rótulos legíveis — a informação nunca depende da animação.
- O que acontece em telas estreitas (mobile) com muitos nós de ambientes? O diagrama deve reorganizar os nós em arranjo vertical ou em grade, sem rolagem horizontal e sem sobreposição de rótulos.
- O que acontece com a animação se o JavaScript falhar ou for bloqueado? Os rótulos dos ambientes e do núcleo devem permanecer visíveis em formato estático, preservando a mensagem da seção.
- O que acontece com os rótulos técnicos (API, MCP) em cada idioma? As siglas técnicas permanecem iguais nos 3 idiomas; apenas os textos descritivos ao redor são traduzidos.
- O que acontece se o visitante usar um leitor de tela? O diagrama deve oferecer uma alternativa textual (ex.: lista das categorias integráveis) para que a informação seja acessível sem a visualização.
- O que acontece com os elementos existentes da página (abas de vertical, comparativo, CTA "Testar Assistente ao Vivo")? Nenhum deles deve sofrer regressão com a inclusão da nova seção e da animação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O card do InterasisAI Connect DEVE exibir um texto de posicionamento que comunique que o produto vai além do agendamento, integrando-se a CRMs, bases de dados, APIs e outros sistemas.
- **FR-002**: O card DEVE comunicar que o produto é expansível conforme a necessidade do cliente, com expansão entregue por projeto de escopo fechado.
- **FR-003**: O card DEVE manter o agendamento inteligente apresentado como funcionalidade básica do produto — o novo posicionamento complementa, não substitui nem contradiz.
- **FR-004**: A página Saiba Mais DEVE conter uma seção dedicada a integrações e expansibilidade do produto.
- **FR-005**: A seção DEVE apresentar as categorias de sistemas integráveis — CRM, base de dados, APIs, MCP, sistemas de RH e outras — em linguagem acessível ao público não técnico.
- **FR-006**: A seção DEVE explicar que a expansão é entregue como projeto de escopo fechado, dimensionado à necessidade de cada cliente.
- **FR-007**: A seção DEVE exibir uma visualização animada do processo de integração: um núcleo central (chat e agentes) conectado por setas animadas em fluxo contínuo aos nós dos ambientes integráveis.
- **FR-008**: A animação DEVE rodar em loop contínuo, sem exigir interação do usuário e sem bloquear a leitura dos demais conteúdos da página.
- **FR-009**: Quando a preferência de movimento reduzido estiver ativa (ou a animação indisponível), o sistema DEVE exibir uma versão estática do diagrama com todos os rótulos legíveis.
- **FR-010**: O diagrama DEVE se reorganizar em telas menores, sem rolagem horizontal e sem sobreposição de rótulos.
- **FR-011**: O diagrama DEVE oferecer alternativa textual (ex.: lista das categorias integráveis) para leitores de tela.
- **FR-012**: Todo o novo conteúdo (texto de posicionamento do card, textos da seção, rótulos do diagrama) DEVE existir nos 3 idiomas do site, acessível pelo prefixo de idioma já utilizado nas demais páginas.
- **FR-013**: O conteúdo DEVE usar categorias genéricas de sistemas; NÃO DEVE sugerir integrações oficiais com marcas/produtos específicos de terceiros, nem citar dados de clientes reais.
- **FR-014**: Os elementos existentes da página Saiba Mais (abas de vertical, comparativo lado a lado, passos do processo, CTA "Testar Assistente ao Vivo", metadados e dados estruturados) DEVE(M) continuar funcionando sem regressão.

### Key Entities

- **Texto de Posicionamento do Card**: Atualização do texto de impacto do card (definido na especificação anterior) para comunicar integração e expansibilidade; possui versão traduzida por idioma.
- **Seção de Integrações**: Bloco de conteúdo da página Saiba Mais que apresenta as categorias integráveis, o modelo de projeto de escopo fechado e o diagrama animado; com textos traduzidos por idioma.
- **Diagrama de Integração**: Visualização composta por um núcleo central (chat e agentes), nós de ambientes (categorias integráveis) e setas animadas; possui dois estados — animado (fluxo contínuo) e estático (fallback de acessibilidade).
- **Categoria de Integração**: Rótulo de um ambiente integrável (CRM, base de dados, API, MCP, sistemas de RH, outras); com nome traduzido por idioma e siglas técnicas preservadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um avaliador de negócio sem conhecimento técnico consegue, em até 15 segundos de leitura do card, descrever com as próprias palavras que o produto se integra a outros sistemas e é expansível — e que o agendamento é apenas a funcionalidade básica.
- **SC-002**: 100% dos visitantes da página Saiba Mais encontram a seção de integrações, e ela renderiza sem quebra de layout nas 3 larguras de tela de referência do site (mobile, tablet, desktop) e nos 3 idiomas suportados.
- **SC-003**: A animação do diagrama é percebida em loop contínuo no desktop; com a preferência de movimento reduzido ativa, 100% dos rótulos aparecem em versão estática legível.
- **SC-004**: Nenhuma regressão na página existente — as abas de vertical e o CTA "Testar Assistente ao Vivo" permanecem 100% funcionais após a inclusão da nova seção.
- **SC-005**: 100% do novo conteúdo (card, seção e diagrama) não menciona marcas de terceiros como parceiras oficiais nem dados de clientes reais.

## Assumptions

- A frase do solicitante "mostrar o poder que ele tem" foi interpretada como comunicar a capacidade de integração (CRMs, bases de dados, APIs, MCP, sistemas de RH) e a expansibilidade do produto além do agendamento — o escopo desta especificação cobre o card e a página Saiba Mais.
- A animação completa do processo de integração fica na página Saiba Mais, onde há espaço para o diagrama; o card (compacto, dentro da grade de portfólio) comunica a mesma mensagem por texto, sem animação. Essa divisão pode ser revisitada caso o solicitante queira uma animação também no card.
- O diagrama representa categorias genéricas de ambientes (sem marcas específicas), evitando sugerir parcerias oficiais que não existem.
- O agendamento continua sendo apresentado como funcionalidade básica do produto; a nova comunicação o contextualiza, não o remove.
- Todo o conteúdo novo segue o padrão dos 3 idiomas do site desde o lançamento, como nas demais páginas institucionais.
- A seção de integrações é um bloco adicional dentro da página Saiba Mais definida na especificação anterior; não altera rotas, metadados ou dados estruturados já existentes.
- "API" e "MCP" aparecem como rótulos no diagrama (pedido explícito do solicitante), acompanhados de descrições em linguagem acessível nos textos ao redor.
- O modelo "projeto de escopo fechado" é comunicado como forma de contratação da expansão, sem exibir preços ou condições comerciais.
