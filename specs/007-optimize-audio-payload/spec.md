# Feature Specification: Otimização de Payload de Áudio e Integração BFF (EDI-25)

**Feature Branch**: `007-create-feature-branch`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "lei a atividade EDI-25 no linear e escreva a especificação para montarmos um plano de exeucução"
**Linear Task**: [EDI-25](https://linear.app/edilsonandrade/issue/EDI-25/implementar-time-stretching-de-audio-e-integracao-com-bff)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar áudio otimizado (Priority: P1)

Como usuário do chat por voz, quero que meu áudio gravado seja otimizado antes do envio para reduzir custo de processamento e manter clareza da mensagem.

**Why this priority**: Esse é o núcleo de valor da EDI-25: reduzir duração do áudio enviado sem perder entendimento da fala.

**Independent Test**: Pode ser testado gravando uma mensagem por voz e validando que a duração do arquivo enviado é menor que a duração originalmente gravada, com resposta do chat concluída.

**Acceptance Scenarios**:

1. **Given** que o usuário gravou uma mensagem de voz válida, **When** o sistema prepara o envio, **Then** o arquivo enviado possui duração menor que o áudio bruto capturado.
2. **Given** que o áudio foi otimizado, **When** o envio é iniciado, **Then** o sistema envia o arquivo de voz no formato esperado pelo serviço intermediário.
3. **Given** que o envio de áudio foi concluído, **When** a requisição finaliza, **Then** o usuário recebe continuidade da conversa sem regressão no fluxo do chat.

---

### User Story 2 - Enviar texto no mesmo canal de integração (Priority: P2)

Como usuário que digita mensagens, quero que o chat continue enviando texto normalmente pelo mesmo serviço intermediário para manter experiência consistente.

**Why this priority**: A integração precisa atender voz e texto sem quebrar o fluxo já usado por quem não utiliza microfone.

**Independent Test**: Pode ser testado enviando somente mensagens de texto e validando que o conteúdo chega ao serviço intermediário com sucesso e gera resposta do chat.

**Acceptance Scenarios**:

1. **Given** que o usuário digitou uma mensagem, **When** ele envia no chat, **Then** o sistema envia o conteúdo textual em estrutura apropriada para processamento.
2. **Given** que o envio textual foi aceito, **When** a requisição retorna, **Then** o usuário visualiza a resposta da conversa normalmente.

---

### User Story 3 - Tratar falhas de envio e de otimização (Priority: P3)

Como usuário, quero receber feedback claro quando ocorrer falha na otimização ou no envio para saber que a mensagem não foi processada e poder tentar novamente.

**Why this priority**: Transparência de erro evita perda silenciosa de mensagem e reduz frustração no uso do chat.

**Independent Test**: Pode ser testado simulando falhas de processamento de áudio e indisponibilidade do serviço intermediário para verificar exibição de erro e possibilidade de nova tentativa.

**Acceptance Scenarios**:

1. **Given** que ocorre falha durante otimização do áudio, **When** o usuário tenta enviar voz, **Then** o sistema informa a falha de forma clara e não envia payload inválido.
2. **Given** que o serviço intermediário está indisponível, **When** o usuário envia voz ou texto, **Then** o sistema exibe erro compreensível e preserva a estabilidade da interface.

---

### Edge Cases

- O que acontece quando o usuário grava áudio muito curto (quase instantâneo)? O sistema deve evitar envio de arquivo inválido e orientar nova tentativa.
- Como o sistema se comporta quando a otimização reduz demais a inteligibilidade da fala? Deve existir limite de otimização para preservar compreensão mínima da mensagem.
- O que acontece quando o endpoint de integração está ausente ou incorreto? O envio deve falhar com feedback explícito ao usuário e sem travar o chat.
- Como o sistema reage a falhas de rede intermitentes? Deve permitir nova tentativa sem perda da mensagem digitada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST otimizar mensagens de voz antes do envio, reduzindo a duração total do áudio em relação ao arquivo originalmente gravado.
- **FR-002**: O sistema MUST preservar inteligibilidade da fala após otimização, mantendo a mensagem compreensível para processamento conversacional.
- **FR-003**: O sistema MUST enviar mensagens de voz ao serviço intermediário como arquivo de áudio no campo esperado pelo contrato de integração.
- **FR-004**: O sistema MUST enviar mensagens de texto ao serviço intermediário como conteúdo textual estruturado.
- **FR-005**: O sistema MUST incluir credenciais de origem nas requisições de envio, conforme política de autenticação do ambiente.
- **FR-006**: O sistema MUST diferenciar automaticamente o tipo de payload de envio com base na origem da mensagem (voz ou texto).
- **FR-007**: O sistema MUST registrar, para observabilidade, evidência de que a duração do áudio enviado é menor que a duração capturada.
- **FR-008**: O sistema MUST tratar falhas de otimização de áudio sem derrubar o fluxo de chat e com mensagem clara ao usuário.
- **FR-009**: O sistema MUST tratar falhas de envio para voz e texto com feedback de erro compreensível e possibilidade de nova tentativa.
- **FR-010**: O sistema MUST manter compatibilidade com o fluxo atual do chat, sem regressão no envio de mensagens textuais.

### Key Entities *(include if feature involves data)*

- **Mensagem de Voz Capturada**: Representa o áudio bruto criado pelo usuário antes da etapa de otimização; atributos principais: duração original, tamanho, validade para envio.
- **Mensagem de Voz Otimizada**: Representa o áudio após otimização temporal, pronto para envio; atributos principais: duração otimizada, tamanho resultante, vínculo com gravação original.
- **Payload de Integração**: Representa o conteúdo enviado ao serviço intermediário; atributos principais: tipo da mensagem (voz ou texto), conteúdo, credenciais de origem.
- **Resultado de Envio**: Representa o desfecho da requisição de integração; atributos principais: sucesso/falha, mensagem de retorno, ação recomendada ao usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em pelo menos 95% dos envios de voz válidos, a duração do áudio enviado é menor que a duração do áudio gravado.
- **SC-002**: Em pelo menos 90% dos testes de validação funcional, a mensagem de voz otimizada permanece compreensível por avaliadores humanos.
- **SC-003**: 100% das mensagens de texto continuam sendo enviadas com sucesso no fluxo padrão, sem aumento de falhas em relação ao baseline anterior da funcionalidade.
- **SC-004**: Em 100% das falhas de otimização ou integração simuladas, o usuário recebe feedback de erro claro em até 2 segundos após a falha.
- **SC-005**: A taxa de conclusão de envio (voz + texto) permanece em no mínimo 98% em ambiente de homologação com serviço intermediário disponível.

## Assumptions

- O fluxo de gravação de voz da feature anterior já está disponível e fornece áudio válido para a etapa de otimização.
- O serviço intermediário disponibiliza um endpoint único para recebimento de voz e texto.
- As credenciais de origem necessárias para autorização já são fornecidas pelo ambiente da aplicação.
- Esta entrega cobre otimização e integração de envio, sem alterar regras de negócio da resposta conversacional.
- A validação de inteligibilidade será feita com critérios funcionais de QA antes de liberar para produção.
