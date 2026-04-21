# Feature Specification: Widget de Chat Multimodal com Feedback de Raciocínio da IA

**Feature Branch**: `005-chatbot-ui-ux`  
**Created**: 2026-04-21  
**Status**: Draft  
**Linear Ticket**: EDI-18  
**Input**: Desenvolver UI/UX do Chatbot com suporte a Texto, Áudio e Feedback de Raciocínio

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante Abre e Interage com o Widget de Chat (Priority: P1)

Um visitante na landing page quer iniciar uma conversa com a Interasis AI para tirar dúvidas sobre os serviços. Ele precisa de um ponto de entrada claro e acessível, disponível em qualquer página do site, para iniciar o diálogo sem sair da página atual.

**Why this priority**: O widget de chat é o principal canal de qualificação de leads. Sem ele, os visitantes não têm como interagir diretamente com a empresa. É a funcionalidade central desta feature — todas as demais histórias dependem desta estar funcional.

**Independent Test**: Pode ser testado abrindo a página, clicando no botão flutuante de chat, digitando uma mensagem e verificando se ela aparece na interface com diferenciação visual em relação a mensagens da IA.

**Acceptance Scenarios**:

1. **Given** o visitante acessa qualquer página do site, **When** a página carrega, **Then** ele vê um botão flutuante de chat no canto inferior direito da tela, acessível sem necessidade de scroll.
2. **Given** o visitante clica no botão flutuante, **When** o clique é processado, **Then** o widget de chat abre com uma animação fluida de entrada, revelando o painel de conversa.
3. **Given** o widget está aberto, **When** o visitante digita uma mensagem e pressiona Enter, **Then** a mensagem aparece na área de conversa com estilo visual diferenciado das mensagens da IA (alinhada à direita, fundo na cor de destaque da marca).
4. **Given** o visitante está digitando uma mensagem com mais de uma linha, **When** o texto ocupa mais espaço vertical, **Then** o campo de entrada expande automaticamente para acomodar o conteúdo sem mostrar barra de rolagem interna.
5. **Given** o visitante quer adicionar uma quebra de linha sem enviar, **When** ele pressiona Shift+Enter, **Then** uma nova linha é inserida no campo e a mensagem não é enviada.
6. **Given** o widget está aberto, **When** o visitante clica no botão de fechar (X), **Then** o widget fecha com uma animação fluida de saída e o botão flutuante volta a ser exibido.

---

### User Story 2 - Visitante Usa o Chat em Dispositivo Móvel (Priority: P1)

Um visitante acessando o site via smartphone quer usar o widget de chat com a mesma facilidade que no desktop, sem que o tamanho da tela comprometa a experiência.

**Why this priority**: O tráfego mobile representa a maior parte das visitas ao site. Uma experiência de chat inadequada em telas menores comprometeria o canal de qualificação de leads para a maioria dos visitantes. Compartilha prioridade P1 com a US1 por ser igualmente crítica.

**Independent Test**: Pode ser testado acessando o site em um dispositivo com largura inferior a 768px, abrindo o widget e verificando se o chat ocupa a tela inteira ou apresenta como bottom sheet, sem cortar ou sobrepor elementos da página.

**Acceptance Scenarios**:

1. **Given** o visitante usa um dispositivo com tela menor que 768px de largura, **When** ele abre o widget de chat, **Then** o chat é exibido em modo tela cheia ou como bottom sheet que sobe da parte inferior da tela — nunca como widget flutuante de tamanho fixo.
2. **Given** o chat está aberto no modo mobile e o visitante foca no campo de texto, **When** o teclado virtual do dispositivo aparece, **Then** a área de entrada de texto permanece visível acima do teclado, sem ser encoberta.
3. **Given** o visitante está no modo mobile com o chat aberto, **When** ele clica em fechar, **Then** o chat retrai com animação adequada ao modo mobile e o botão flutuante reaparecer normalmente.
4. **Given** o visitante usa um dispositivo com largura igual ou superior a 768px, **When** ele abre o widget, **Then** o chat aparece como painel flutuante no canto inferior direito da tela, com dimensões que não ocupem a tela inteira.

---

### User Story 3 - Visitante Envia Mensagem por Voz (Priority: P2)

Um visitante prefere não digitar e quer enviar sua dúvida por voz diretamente no widget de chat, usando o microfone do dispositivo.

**Why this priority**: A entrada por voz reduz a barreira de interação para usuários que preferem comunicação oral e aumenta o potencial de engajamento. É um diferencial da interface, mas não bloqueia o fluxo de uso básico de texto.

**Independent Test**: Pode ser testado clicando no botão de microfone, concedendo permissão de áudio, gravando uma frase e verificando se o ícone pulsa durante a gravação e se o blob de áudio é registrado no console ao encerrar a gravação.

**Acceptance Scenarios**:

1. **Given** o visitante está com o widget aberto, **When** ele clica no botão de microfone pela primeira vez, **Then** o navegador apresenta a solicitação de permissão de acesso ao microfone.
2. **Given** a permissão foi concedida e a gravação está ativa, **When** o sistema captura o áudio, **Then** o ícone do microfone exibe uma animação de pulso visivelmente na cor de destaque principal da marca.
3. **Given** a gravação está ativa, **When** o visitante clica novamente no botão de microfone, **Then** a gravação é encerrada e o áudio capturado é registrado no console do navegador para validação (comportamento mock desta versão).
4. **Given** a permissão de microfone foi negada pelo usuário ou pelo dispositivo, **When** o visitante tenta usar o recurso de voz, **Then** o sistema exibe um feedback de erro visível e acessível informando que a permissão de microfone é necessária.

---

### User Story 4 - Visitante Acompanha o Processo de Raciocínio da IA (Priority: P3)

Após enviar uma mensagem, o visitante espera por uma resposta e precisa de feedback visual que comunique que o sistema está processando ativamente — não travado ou lento.

**Why this priority**: O feedback de raciocínio reduz a ansiedade do usuário durante a espera e humaniza a interação, transmitindo a sofisticação da IA. Depende das US1 e US2 para ser experenciada.

**Independent Test**: Pode ser testado enviando uma mensagem e verificando se mensagens de progresso contextuais com animação de pulso aparecem antes da resposta final simulada, e desaparecem quando a resposta chega.

**Acceptance Scenarios**:

1. **Given** o visitante enviou uma mensagem, **When** o sistema inicia o processamento, **Then** uma área de status aparece na interface exibindo mensagens de progresso contextuais (ex: "Analisando sua empresa...", "Consultando especialistas...").
2. **Given** o status de raciocínio está visível, **When** o visitante observa a interface, **Then** ele vê uma animação de pulso sutil associada ao indicador de status, confirmando que o sistema está ativo.
3. **Given** o processamento é concluído e a resposta chega, **When** a mensagem da IA é renderizada, **Then** a área de status desaparece e a resposta final aparece como uma mensagem da IA na área de conversa, alinhada à esquerda.

---

### Edge Cases

- O que acontece se o usuário tentar usar o microfone em um ambiente sem suporte à MediaRecorder API (ex: iOS Safari em versões antigas)?
- O que acontece se o usuário digitar uma mensagem com muitos caracteres (ex: > 2000 caracteres)?
- Como a área de conversa se comporta quando há muitas mensagens e o painel fica longo — a última mensagem é exibida automaticamente?
- O que acontece se o widget for aberto e fechado repetidamente em rápida sucessão (race condition de animação)?
- Como o widget reage ao redimensionamento da janela enquanto está aberto — ele troca entre modo mobile e desktop corretamente?
- O que acontece com as animações quando `prefers-reduced-motion` está ativo no sistema operacional?

## Requirements *(mandatory)*

### Functional Requirements

#### Widget e Controle de Abertura

- **FR-001**: O sistema DEVE exibir um botão flutuante de chat permanentemente visível no canto inferior direito da tela em todas as páginas que utilizam o layout principal.
- **FR-002**: O widget de chat DEVE abrir e fechar com animações fluidas, sem saltos ou flickering perceptível.
- **FR-003**: O estado de aberto/fechado do widget DEVE ser controlado globalmente via um mecanismo de estado compartilhado (ChatContext), permitindo que qualquer componente da aplicação acione a abertura do chat.
- **FR-004**: Em dispositivos com largura de tela inferior a 768px, o widget aberto DEVE ocupar a tela inteira ou apresentar-se como bottom sheet — nunca como painel flutuante de tamanho fixo.
- **FR-005**: Em dispositivos com largura de tela igual ou superior a 768px, o widget aberto DEVE aparecer como painel flutuante fixo no canto inferior direito, sem ocupar a tela inteira.

#### Estilo Visual e Design Tokens

- **FR-006**: O fundo do painel do widget DEVE usar o token `surface.base` com opacidade reduzida combinado com `backdrop-blur` alto, produzindo o efeito glassmorphism consistente com a estética "Tech/Glow" do projeto.
- **FR-007**: A borda do painel do widget DEVE usar o token `brand.primary` com opacidade baixa (efeito sutil de brilho Tech/Glow), sem borda sólida e grossa.
- **FR-008**: Todos os textos dentro do widget DEVEM usar os tokens semânticos do projeto: `text.strong` para conteúdo principal (nomes, títulos, mensagens do usuário), `text.body` para texto secundário e descrições.
- **FR-009**: Botões de ação dentro do widget (enviar mensagem, abrir/fechar) DEVEM usar os tokens `brand.primary` para estado normal e `brand.primaryHover` para o estado hover.
- **FR-010**: O botão flutuante de abertura do chat DEVE ter fundo na cor do token `brand.primary` e exibir mudança visual no hover usando o token `brand.primaryHover`.
- **FR-011**: O título ou label do widget (ex: "Interasis AI" no cabeçalho do painel) DEVE usar a família tipográfica Space Grotesk, consistente com os títulos da landing page.
- **FR-012**: As mensagens textuais na área de conversa DEVEM usar a família tipográfica sans-serif padrão do sistema (sem Space Grotesk), garantindo boa legibilidade em tamanhos menores.

#### Área de Conversa e Mensagens

- **FR-013**: As mensagens enviadas pelo usuário DEVEM ser exibidas à direita na área de conversa, com fundo na cor do token `brand.primary` e texto na cor `text.inverse` (branco).
- **FR-014**: As mensagens da IA DEVEM ser exibidas à esquerda na área de conversa, com fundo na cor do token `surface.subtle` e texto na cor `text.strong`.
- **FR-015**: A área de conversa DEVE rolar automaticamente para exibir a mensagem mais recente sempre que uma nova mensagem for adicionada à lista.
- **FR-016**: O arredondamento dos balões de mensagem DEVE usar o token de forma `shape.card` (1rem / `rounded-card`), exceto no canto do balão que "aponta" para o lado do remetente, que deve ter arredondamento reduzido.

#### Entrada de Texto

- **FR-017**: O widget DEVE conter um campo de entrada de texto (textarea) que expanda automaticamente em altura conforme o usuário digita, com uma altura mínima de uma linha e uma altura máxima razoável (ex: 5-6 linhas), após a qual uma barra de rolagem interna deve aparecer.
- **FR-018**: Pressionar a tecla Enter (sem modificadores) no campo de texto DEVE enviar a mensagem imediatamente.
- **FR-019**: Pressionar Shift+Enter no campo de texto DEVE inserir uma quebra de linha, sem enviar a mensagem.
- **FR-020**: Após o envio da mensagem, o campo de texto DEVE ser esvaziado e o foco deve retornar automaticamente ao campo, pronto para nova entrada.
- **FR-021**: O campo de texto DEVE ter um placeholder descritivo que oriente o usuário (ex: "Digite sua mensagem...").
- **FR-022**: O campo de texto DEVE ter borda usando o token `border.subtle` e, quando em foco, realçar com uma borda na cor `brand.primary` com baixa opacidade.

#### Entrada por Voz (Microfone)

- **FR-023**: O widget DEVE exibir um botão de microfone na área de entrada, posicionado adjacente ao campo de texto e ao botão de enviar.
- **FR-024**: Ao clicar no botão de microfone, o sistema DEVE iniciar a captura de áudio via a API nativa do navegador (MediaRecorder API ou equivalente).
- **FR-025**: Durante a gravação ativa, o ícone do microfone DEVE exibir uma animação de pulso na cor do token `brand.primary`, indicando visualmente que a captura está em andamento.
- **FR-026**: Um segundo clique no botão de microfone durante a gravação DEVE encerrar a captura e registrar o blob de áudio no console do navegador (comportamento mock desta versão; integração real com API de voz é escopo futuro).
- **FR-027**: Se a API de captura de áudio não for suportada pelo navegador ou a permissão for negada, o sistema DEVE exibir uma mensagem de erro acessível ao usuário na interface, sem lançar erro não tratado.

#### Feedback de Raciocínio da IA (ChatStatus)

- **FR-028**: O sistema DEVE exibir um componente de status (`ChatStatus`) na área de conversa após o envio de uma mensagem pelo usuário e antes da chegada da resposta da IA.
- **FR-029**: O `ChatStatus` DEVE exibir mensagens de progresso contextuais, com pelo menos três variações: "Analisando sua empresa...", "Consultando especialistas...", e uma terceira variação adequada (ex: "Preparando sua resposta...").
- **FR-030**: O `ChatStatus` DEVE apresentar uma animação de pulso sutil junto às mensagens de progresso, usando a cor do token `brand.primary` como cor de destaque do indicador.
- **FR-031**: O `ChatStatus` DEVE desaparecer completamente quando a resposta da IA for renderizada na área de conversa.
- **FR-032**: O texto do `ChatStatus` DEVE usar a cor do token `text.body` para as mensagens de progresso, garantindo legibilidade sem competir visualmente com as mensagens da conversa.

#### Arquitetura de Componentes e Testes

- **FR-033**: A lógica de estado do chat (lista de mensagens, estados de carregamento, controle do microfone, tratamento de erros) DEVE estar completamente encapsulada em um hook customizado de React, separado da camada de renderização visual.
- **FR-034**: O componente visual principal do widget DEVE consumir o hook de lógica e apenas renderizar a interface com base nos dados e ações que o hook expõe — sem lógica de estado ou efeitos colaterais diretos no componente.
- **FR-035**: O hook de lógica DEVE ter cobertura de testes unitários cobrindo obrigatoriamente os seguintes cenários: adição de mensagem do usuário à lista, transição para estado de carregamento após envio, adição de resposta mock da IA, e estado de erro quando a captura de áudio falha.
- **FR-036**: Os testes unitários DEVEM seguir os padrões já estabelecidos no projeto (Jest + React Testing Library + configuração do `jest.config.mjs`), e todos DEVEM passar sem erros.
- **FR-037**: A implementação NÃO DEVE modificar o arquivo `layout.tsx` existente. O `ChatWidget` deve ser integrado ao layout de forma aditiva, sem alterar estrutura existente.
- **FR-038**: Quando `prefers-reduced-motion` estiver ativo, as animações do widget (abertura, fechamento, pulso do microfone, ChatStatus) DEVEM ser suprimidas ou reduzidas, seguindo o comportamento padrão da biblioteca de animação em uso.

### Key Entities

- **ChatWidget**: Componente principal de UI que encapsula toda a interface do chat. Existe em dois modos visuais: painel flutuante fixo (desktop ≥ 768px) e tela cheia/bottom sheet (mobile < 768px). Controlado pelo `ChatContext` para o estado de abertura.
- **ChatMessage**: Representa uma mensagem individual na conversa. Atributos: tipo (usuário ou IA), conteúdo de texto, timestamp de criação e identificador único. Determina o lado e o estilo do balão na área de conversa.
- **ChatStatus**: Sub-componente de feedback visual exibido durante o processamento da IA. Exibe mensagens de progresso textuais rotativas com animação de pulso. Visível apenas no intervalo entre envio e recebimento de resposta.
- **ChatContext**: Estado global de React que armazena o flag de abertura/fechamento do widget e provê ações (abrir, fechar, alternar) acessíveis a qualquer componente da aplicação.
- **useChatAssistant**: Hook customizado de React que centraliza: lista de `ChatMessage`, estado de carregamento (para exibição do `ChatStatus`), lógica de envio de mensagem (mock), controle de gravação de áudio (MediaRecorder) e estados de erro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um visitante sem instruções consegue localizar o botão de chat, abrí-lo, enviar uma mensagem e fechar o widget em até 30 segundos em um teste de usabilidade com 5 participantes (100% de taxa de conclusão).
- **SC-002**: A interface do chat é completamente funcional e visualmente correta em qualquer largura de tela entre 320px e 1920px, sem sobreposição, corte ou perda de funcionalidade.
- **SC-003**: 100% dos testes unitários do hook de lógica passam, cobrindo os 4 cenários obrigatórios: envio de mensagem, transição de estado de carregamento, recebimento de resposta mock, e erro de captura de áudio.
- **SC-004**: As mensagens do usuário e da IA são distinguíveis visualmente à primeira vista por 100% dos revisores de design, sem necessidade de leitura de label ou explicação adicional.
- **SC-005**: O feedback visual de gravação de voz (animação de pulso no ícone do microfone) é percebido e compreendido por 100% dos revisores de design sem instrução prévia.
- **SC-006**: O `ChatStatus` com mensagens de progresso é reconhecido como indicador de atividade do sistema por 100% dos revisores de design, transmitindo a mensagem de que a IA está processando.
- **SC-007**: O widget abre e fecha com animações percebidas como fluidas (sem saltos, flickering ou delay excessivo) por 100% dos revisores de design em desktop e mobile.
- **SC-008**: O objeto de áudio capturado pelo microfone aparece corretamente no console do navegador ao encerrar a gravação, validando a captura sem erros não tratados (quando a permissão foi previamente concedida).

## Assumptions

- O componente `<FadeIn>` e a biblioteca `framer-motion` já estão instalados e funcionais no projeto (implementados na feature 003).
- Os design tokens de cores (`brand.primary`, `brand.primaryHover`, `surface.base`, `surface.subtle`, `text.strong`, `text.body`, `border.subtle`) já estão definidos e sincronizados com o Tailwind CSS (feature 002).
- O `layout.tsx` já inclui `<Header>` e `<Footer>` e envolve as páginas automaticamente; o `ChatWidget` será adicionado ao layout de forma aditiva, sem alterar sua estrutura.
- A biblioteca de ícones `lucide-react` já está disponível no projeto e será usada para os ícones de microfone (`Mic`, `MicOff`), enviar (`Send`), fechar (`X`) e o ícone do botão flutuante (`MessageCircle` ou equivalente).
- A estética "Tech/Glow" do projeto usa o dark theme com glassmorphism, conforme implementado nas features anteriores (tokens de superfície escuros, efeito `backdrop-blur`, bordas com `brand.primary` em baixa opacidade).
- O `ChatContext` será criado nesta feature, posicionado em `src/context/` (ou equivalente conforme convenção do projeto).
- A lógica de envio de mensagens para APIs de LLM é completamente mockada nesta versão: a resposta da IA será simulada localmente com um delay artificial para fins de teste da UI.
- A gravação de áudio opera via toggle: primeiro clique inicia, segundo clique encerra. Não há encerramento automático por silêncio ou por tempo limite nesta versão.
- Testes unitários seguem os padrões já estabelecidos no projeto (Jest + React Testing Library + configuração existente no `jest.config.mjs` e `jest.setup.ts`).
- O suporte a `prefers-reduced-motion` seguirá o comportamento padrão do `framer-motion` — quando a preferência estiver ativa, as animações são automaticamente desativadas.
- A família tipográfica Space Grotesk já está configurada globalmente no projeto para títulos; o texto das mensagens usará a fonte sans-serif padrão do sistema.
- O breakpoint de 768px diferencia o comportamento mobile do desktop, seguindo a convenção do Tailwind CSS (`md:`) já usada nas features anteriores.
- Não há integração real com backend de IA, API de voz-para-texto (STT) ou texto-para-voz (TTS) nesta feature; estas integrações são escopo de features futuras.
