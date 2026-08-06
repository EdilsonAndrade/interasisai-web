# Feature Specification: Alinhamento do Chat Gateway com o Contrato Multimodal do BFF

**Feature Branch**: `008-align-chat-bff-contract`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "Criar especificação baseada na resposta do backend para chamarmos o serviço de envio de áudio ou texto pelo chat. Endpoint único multimodal: POST /chat/message. Base URL local: http://localhost:3001. Documentação interativa: http://localhost:3001/api/docs."

## Clarifications

### Session 2026-04-30

- Q: Comportamento ao exceder 10 MB de áudio (FR-013)? → A: Bloquear localmente sem chamar a rede; falha amigável e não recuperável.
- Q: Texto opcional acompanhando áudio (FR-005)? → A: Apenas no gateway; sem mudança de UI nesta feature.
- Q: Contrato de resposta canonical do BFF? → A: Preferir `response_text`/`response_audio_base64`; usar `text`/`audio.contentBase64` apenas como fallback; preservar `responseId`/`sessionId`/`correlationId`/`cache`.
- Q: Limite máximo de texto por requisição? → A: 4000 caracteres, validados no frontend antes do envio.
- Q: Mapeamento de erros HTTP do BFF? → A: 400 `rejected` (payload inválido), 403 `blocked` (origem não permitida), 429 `rejected` (throttling 10/min), 502 `failed` (upstream AI Engine); `reason` exibido ao usuário.
- Q: Cabeçalho `Cache-Control`? → A: Respeitar diretiva do BFF para reuso em memória de sessão; nunca persistir em disco; em erros virá `no-store`.
- Q: `correlationId`? → A: Logar em todos os eventos de UI relacionados à requisição.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar texto pelo endpoint multimodal único (Priority: P1)

Como usuário do chat que digita mensagens, quero que o frontend envie meu texto ao serviço intermediário no formato exato esperado pelo backend, para que minha mensagem seja aceita na primeira tentativa e a resposta da assistente apareça sem falhas de contrato.

**Why this priority**: O envio de texto é o caminho mais frequente do chat e qualquer divergência de contrato (caminho do endpoint, nome dos campos, estrutura do corpo) bloqueia toda a conversa, incluindo voz, pois o mesmo endpoint é multimodal.

**Independent Test**: Pode ser validado digitando uma mensagem no chat, observando que a requisição é aceita pelo serviço intermediário (status de sucesso) e que a resposta da assistente é exibida ao usuário, sem necessidade de gravação de áudio.

**Acceptance Scenarios**:

1. **Given** que o usuário digitou uma mensagem válida, **When** ele aciona o envio, **Then** o sistema envia uma única requisição ao endpoint multimodal contendo o conteúdo textual no campo esperado pelo backend.
2. **Given** que o backend respondeu com sucesso, **When** a resposta chega ao frontend, **Then** o usuário visualiza a resposta da assistente preservando o histórico da conversa.
3. **Given** que o backend respondeu com erro de validação, **When** o frontend recebe o erro, **Then** o sistema exibe a mensagem ao usuário e permite nova tentativa sem reiniciar o chat.

---

### User Story 2 - Enviar áudio (com texto opcional) no mesmo endpoint multimodal (Priority: P1)

Como usuário que grava mensagens de voz, quero que o frontend envie meu áudio capturado pelo navegador no formato exato esperado pelo backend (arquivo binário em multipart, com possibilidade de incluir texto adicional), para que a assistente processe minha fala sem rejeição de contrato.

**Why this priority**: O envio de áudio é o segundo caso de uso central do chat. Sem alinhamento ao contrato (campo `audio`, formato multipart, blob binário sem conversão para Base64, texto opcional anexável), a funcionalidade de voz fica indisponível mesmo com o usuário capaz de gravar.

**Independent Test**: Pode ser validado gravando uma mensagem de voz, enviando-a (com ou sem texto adicional) e confirmando que o serviço intermediário aceita a requisição multipart e retorna a resposta da assistente.

**Acceptance Scenarios**:

1. **Given** que o usuário gravou uma mensagem de voz válida, **When** ele envia, **Then** o sistema envia uma requisição multipart ao endpoint multimodal contendo o arquivo binário de áudio no campo esperado pelo backend, sem conversão para Base64.
2. **Given** que o usuário gravou voz e também digitou texto adicional, **When** ele envia, **Then** o sistema inclui o texto como campo opcional na mesma requisição multipart, em conjunto com o arquivo de áudio.
3. **Given** que o backend respondeu com sucesso ao envio de áudio, **When** a resposta chega ao frontend, **Then** o usuário recebe a resposta da assistente sem regressão no fluxo do chat.

---

### User Story 3 - Compatibilidade do contrato de resposta com o fluxo atual (Priority: P2)

Como mantenedor do frontend, quero que o consumo da resposta do backend continue compatível com o comportamento já entregue na funcionalidade anterior do chat (003), para que o alinhamento do contrato de envio não introduza regressão na exibição da resposta da assistente.

**Why this priority**: O contrato de resposta JSON do backend é declaradamente retrocompatível com a feature 003. O frontend deve preservar essa compatibilidade ao normalizar a resposta, evitando regressões em mensagens existentes.

**Independent Test**: Pode ser validado inspecionando uma resposta de sucesso do backend e confirmando que o frontend continua exibindo a resposta da assistente da mesma forma que antes do realinhamento, sem quebra de UI.

**Acceptance Scenarios**:

1. **Given** que o backend retorna uma resposta de sucesso no formato documentado, **When** o frontend processa a resposta, **Then** o usuário vê o conteúdo da assistente exibido conforme o comportamento já existente.
2. **Given** que o backend retorna um erro descritivo, **When** o frontend processa a resposta, **Then** a mensagem de erro é apresentada ao usuário sem quebra do estado da conversa.
3. **Given** que a resposta contém os campos canonical (`response_text`, `response_audio_base64`) e os campos legados (`text`, `audio.contentBase64`), **When** o frontend lê a resposta, **Then** os campos canonical têm precedência e os legados são usados apenas como fallback.
4. **Given** que a resposta contém `responseId`, `sessionId` e `correlationId`, **When** o frontend processa a resposta, **Then** esses identificadores são registrados em logs/observabilidade do cliente para rastreio.

---

### User Story 5 - Reprodução do áudio de resposta da assistente (Priority: P2)

Como usuário do chat, quero ouvir a resposta gerada pela IA quando o backend incluir áudio na resposta, para ter uma experiência conversacional natural.

**Why this priority**: O contrato de resposta carrega `response_audio_base64` (e fallback `audio.contentBase64` + `audio.mimeType`); ignorar esse campo desperdiça um valor já entregue pelo backend.

**Independent Test**: Pode ser validado enviando uma mensagem cuja resposta contenha áudio em Base64 e confirmando que o frontend decodifica e disponibiliza a reprodução ao usuário sem travar o chat.

**Acceptance Scenarios**:

1. **Given** que a resposta do backend contém áudio em Base64, **When** o frontend processa a resposta, **Then** o usuário recebe o áudio disponível para reprodução em formato compatível com o navegador.
2. **Given** que a resposta não contém áudio, **When** o frontend processa a resposta, **Then** apenas o texto da assistente é apresentado, sem erros.

---

### User Story 4 - Boas práticas de captura de áudio no navegador (Priority: P3)

Como usuário que grava voz pelo navegador, quero que a captura siga formatos suportados pelos navegadores modernos e respeite limites práticos de tamanho, para que o envio seja confiável e não falhe por payload excessivo.

**Why this priority**: As boas práticas de captura (formato WebM/Opus em Chrome/Edge ou MP4 em Safari, blob direto sem Base64, limite prático de tamanho por requisição) são recomendadas pelo backend e impactam confiabilidade, mas não bloqueiam o caminho funcional principal quando os usuários estão dentro dos limites comuns de uso.

**Independent Test**: Pode ser validado gravando voz em um navegador suportado e confirmando que o arquivo enviado está em formato aceito pelo backend e respeita o limite máximo recomendado de tamanho por requisição.

**Acceptance Scenarios**:

1. **Given** que o usuário grava voz em um navegador suportado, **When** o sistema prepara o envio, **Then** o arquivo é enviado em formato compatível com a captura nativa do navegador, sem conversão para Base64.
2. **Given** que o áudio capturado se aproxima do limite prático recomendado, **When** o usuário tenta enviar, **Then** o sistema impede ou alerta o envio de payloads acima do limite, evitando rejeição pelo backend.

---

### Edge Cases

- O que acontece quando a configuração do endpoint multimodal está ausente, vazia ou inválida no ambiente do frontend? O envio deve falhar com mensagem clara ao usuário e diagnóstico para o operador.
- Como o sistema se comporta quando o usuário tenta enviar texto vazio ou apenas espaços? O envio deve ser bloqueado antes de tocar a rede.
- Como o sistema se comporta quando o usuário tenta enviar texto acima do limite máximo (4000 caracteres)? O envio MUST ser bloqueado localmente antes de qualquer chamada de rede, com mensagem clara informando o limite e classificação como falha não recuperável.
- Como o sistema se comporta quando o usuário envia áudio com tamanho acima do limite prático recomendado? O envio MUST ser bloqueado localmente antes de qualquer chamada de rede, com mensagem clara e classificada como falha não recuperável (sem botão de tentar mesmo assim).
- O que acontece quando o backend responde 400 (`rejected`)? Exibir a `reason` retornada e classificar como falha não recuperável (usuário precisa ajustar o conteúdo).
- O que acontece quando o backend responde 403 (`blocked` por origem não permitida)? Exibir mensagem amigável orientando que a origem não está autorizada e classificar como falha não recuperável.
- O que acontece quando o backend responde 429 (`rejected` por rate limit, 10/min)? Exibir mensagem orientando o usuário a aguardar e classificar como falha recuperável.
- O que acontece quando o backend responde 502 (`failed` por falha no upstream AI Engine)? Exibir mensagem amigável e classificar como falha recuperável.
- O que acontece quando o backend responde com formato inesperado (ex.: corpo não-JSON)? O frontend deve exibir falha amigável e não derrubar o chat.
- Como o sistema lida com indisponibilidade temporária do backend (5xx, timeout)? Deve sinalizar erro recuperável e permitir nova tentativa.
- Como o sistema lida com requisição não autenticada/sem credenciais de origem? Deve garantir que credenciais sejam enviadas conforme política do ambiente, evitando rejeição por CORS/autorização.
- Como o sistema lida com o cabeçalho `Cache-Control` da resposta? Deve respeitar a diretiva enviada pelo BFF para reuso em memória de sessão (sem persistência em disco) e tratar `no-store` como não cacheável.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST utilizar um único endpoint multimodal de envio de mensagens (texto e áudio), conforme contrato publicado pelo backend, sem manter caminhos paralelos divergentes.
- **FR-002**: O sistema MUST permitir configurar a URL base e o caminho do endpoint multimodal por ambiente, sem exigir alteração de código.
- **FR-003**: O sistema MUST enviar mensagens de texto como JSON estruturado contendo o conteúdo textual no campo esperado pelo backend, sem campos extras não previstos no contrato.
- **FR-004**: O sistema MUST enviar mensagens de áudio como requisição multipart contendo o arquivo binário de áudio no campo esperado pelo backend, sem converter o conteúdo para Base64.
- **FR-005**: O sistema MUST suportar, no envio de áudio, a inclusão opcional de texto adicional como campo na mesma requisição multipart **na camada de serviço (gateway)**; nenhuma alteração de interface (campo de texto adicional ao gravar) faz parte do escopo desta feature.
- **FR-006**: O sistema MUST evitar enviar manualmente cabeçalho de tipo de conteúdo em requisições multipart, deixando o agente HTTP definir os limites do envio binário automaticamente.
- **FR-007**: O sistema MUST incluir credenciais de origem nas requisições de envio, conforme política de autenticação do ambiente.
- **FR-008**: O sistema MUST validar localmente entradas inválidas antes do envio (texto vazio/em branco; áudio sem conteúdo) e bloquear a chamada com mensagem clara ao usuário.
- **FR-009**: O sistema MUST normalizar respostas de sucesso do backend de forma retrocompatível com o fluxo de chat anteriormente entregue, preservando a exibição da resposta da assistente ao usuário.
- **FR-010**: O sistema MUST normalizar respostas de erro do backend extraindo a mensagem descritiva quando presente, com fallback amigável quando ausente, e classificar falhas como recuperáveis ou não para orientar nova tentativa.
- **FR-011**: O sistema MUST tratar respostas com corpo ausente, não-JSON ou inesperado sem derrubar o estado do chat, exibindo mensagem amigável.
- **FR-012**: O sistema MUST orientar a captura de áudio no navegador a usar formato compatível com a captura nativa do navegador do usuário, sem conversão para Base64 antes do envio.
- **FR-013**: O sistema MUST aplicar um limite prático máximo de tamanho de payload de áudio por requisição alinhado à recomendação do backend, **bloqueando localmente o envio antes de qualquer chamada de rede** quando o limite for excedido e exibindo mensagem amigável classificada como falha não recuperável.
- **FR-014**: O sistema MUST manter testes automatizados que evidenciem o alinhamento do contrato de envio (caminho do endpoint, nome dos campos, ausência de campos não previstos) tanto para texto quanto para áudio.
- **FR-015**: O sistema MUST documentar, no nível de ambiente, qual variável controla a URL do endpoint multimodal e qual valor padrão é assumido em desenvolvimento local.
- **FR-016**: O sistema MUST ler a resposta de sucesso preferindo os campos canonical `response_text` e `response_audio_base64`, usando `text` e `audio.contentBase64` (com `audio.mimeType`) apenas como fallback quando os canonical estiverem ausentes.
- **FR-017**: O sistema MUST validar localmente que o conteúdo textual enviado tem no máximo 4000 caracteres e bloquear o envio com mensagem clara quando exceder, sem tocar a rede.
- **FR-018**: O sistema MUST mapear os códigos de erro do backend (400 `rejected`, 403 `blocked`, 429 `rejected` por throttling, 502 `failed` por upstream) para mensagens compreensíveis ao usuário, classificando 429 e 502 como recuperáveis e 400/403 como não recuperáveis, extraindo o campo `reason` quando presente.
- **FR-019**: O sistema MUST registrar `correlationId`, `responseId` e `sessionId` da resposta em logs/observabilidade do cliente, vinculando-os ao evento de UI correspondente para rastreio fim a fim.
- **FR-020**: O sistema MUST respeitar a diretiva `Cache-Control` retornada pelo BFF para reuso em memória de sessão quando a resposta for cacheável; nenhuma resposta MUST ser persistida em disco/localStorage; respostas com `no-store` (incluindo erros) não MUST ser reaproveitadas.
- **FR-021**: O sistema MUST consumir o campo `cache` da resposta (`cache.cacheable`, `cache.source`) como sinal complementar para decisão de reuso em sessão, alinhado ao cabeçalho `Cache-Control`.
- **FR-022**: O sistema MUST disponibilizar o áudio de resposta da assistente (quando presente em `response_audio_base64` ou `audio.contentBase64`) para reprodução pelo usuário, decodificando Base64 no cliente sem persistir em disco.
- **FR-023**: O sistema MUST NOT enviar nenhum campo `internalSecret` em requisições ao BFF.

### Key Entities *(include if feature involves data)*

- **Mensagem de Texto Enviada**: Conteúdo textual digitado pelo usuário (≤ 4000 caracteres após `trim`), estruturado como JSON conforme contrato, sem campos extras e sem `internalSecret`.
- **Mensagem de Áudio Enviada**: Arquivo binário capturado pelo navegador (≤ 10 MB), transportado como parte multipart com nome de campo definido pelo contrato (`audio`); pode acompanhar texto adicional opcional (`text`).
- **Resposta da Assistente**: Conteúdo retornado pelo backend em JSON contendo campos canonical (`input_text`, `response_text`, `response_audio_base64`) e campos legados retrocompatíveis (`text`, `audio` com `mimeType` e `contentBase64`), além de identificadores (`responseId`, `sessionId`, `correlationId`), `status` e bloco `cache` (`cacheable`, `source`). Os canonical têm precedência.
- **Áudio de Resposta**: Conteúdo binário decodificado a partir de Base64, disponível apenas em memória de sessão, com `mimeType` informado quando vier do bloco `audio` legado.
- **Erro de Envio**: Estrutura de falha contendo classificação de recuperabilidade, código de status HTTP, `status` semântico do BFF (`rejected`/`blocked`/`failed`), `reason` descritivo e referência ao corpo bruto.
- **Sinal de Cache**: Combinação do cabeçalho `Cache-Control` (decisivo) com o bloco `cache` do corpo (complementar) usada para decidir reuso em memória de sessão; nunca persistido em disco.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das requisições de envio de texto e áudio originadas pelo chat utilizam o endpoint multimodal único definido pelo contrato do backend, sem caminhos divergentes em uso.
- **SC-002**: 100% dos envios de texto bem-sucedidos resultam em exibição da resposta da assistente ao usuário, em ambiente de validação contra o backend local documentado.
- **SC-003**: 100% dos envios de áudio bem-sucedidos transportam o arquivo binário diretamente em multipart, sem qualquer codificação Base64 no caminho frontend → backend.
- **SC-004**: Zero requisições de áudio do chat excedem o limite prático máximo recomendado de tamanho por requisição, garantido por validação no frontend antes do envio.
- **SC-005**: Zero regressões na exibição de respostas da assistente comparado ao comportamento anterior do chat, verificadas por testes automatizados de normalização de resposta.
- **SC-006**: Falhas de envio (rede, indisponibilidade do backend, erro de validação) resultam em mensagem visível ao usuário em até 1 segundo após a resposta/erro, sem travar a interface do chat.
- **SC-007**: A configuração do endpoint pode ser alterada por variável de ambiente sem qualquer alteração de código, validada em pelo menos um ambiente além do desenvolvimento local.
- **SC-008**: 100% das respostas com `response_text` têm precedência sobre `text` no consumo do frontend, verificado por testes automatizados.
- **SC-009**: Zero requisições de texto excedem 4000 caracteres, garantido por validação no frontend antes do envio.
- **SC-010**: 100% dos eventos de UI relacionados a uma requisição de chat carregam o `correlationId` da resposta nos logs, quando disponível.
- **SC-011**: Zero respostas do BFF são persistidas em disco/localStorage; cache de resposta vive apenas em memória de sessão e respeita `Cache-Control` (incluindo `no-store`).
- **SC-012**: 100% dos códigos de erro 400/403/429/502 do BFF são mapeados para mensagens específicas ao usuário, com classificação correta de recuperabilidade.

## Assumptions

- O backend mantém a documentação interativa local em `http://localhost:3001/api/docs` como referência de contrato durante o desenvolvimento; a especificação de campos/caminho usada aqui se alinha à descrição fornecida pelo guia de integração compartilhado.
- O caminho exato do endpoint multimodal informado é `POST /chat/message` (singular), e o frontend deve ajustar qualquer divergência atual (ex.: caminho no plural) para esse valor.
- O nome do campo de arquivo de áudio em multipart, esperado pelo backend, é `audio`, e o nome do campo opcional de texto adicional em multipart é `text`.
- O envio JSON de texto utiliza um único campo de conteúdo textual chamado `text`, sem campos auxiliares de tipo/categoria.
- O limite máximo de tamanho textual por requisição é 4000 caracteres, validado no frontend antes do envio.
- O limite prático de tamanho de áudio por requisição segue a recomendação do guia de integração (≤ 10 MB), aplicado como limite máximo no frontend.
- O backend aplica throttling de 10 requisições por minuto (HTTP 429); o frontend trata como falha recuperável.
- Origens não autorizadas são rejeitadas com HTTP 403 (`blocked`); falhas no AI Engine upstream são reportadas com HTTP 502 (`failed`).
- A resposta de sucesso contém simultaneamente os campos canonical (`response_text`, `response_audio_base64`) e legados (`text`, `audio.contentBase64`); o frontend trata os canonical como preferência e os legados apenas como fallback.
- O cabeçalho `Cache-Control` enviado pelo BFF é a diretiva autoritativa para reuso de resposta em memória de sessão; o bloco `cache` no corpo é sinal complementar.
- A política de credenciais (`credentials: "include"`) já é o padrão adotado pelo frontend e deve ser preservada nas requisições alinhadas.
- O frontend NUNCA envia o campo `internalSecret`; segredos são de uso exclusivo de serviços internos.
- Métricas de duração de áudio (original/otimizada) usadas em features anteriores não fazem parte do contrato do backend e não devem ser enviadas como campos da requisição; permanecem como observabilidade interna do frontend.
- Captura de áudio no navegador continua sendo realizada por meio do gravador nativo do navegador, em formato suportado por Chrome/Edge (WebM/Opus) ou Safari (MP4), sem conversão para Base64 no envio (a Base64 da resposta vem do backend e é decodificada no cliente apenas para reprodução em memória).
