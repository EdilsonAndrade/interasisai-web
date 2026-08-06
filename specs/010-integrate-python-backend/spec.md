# Feature Specification: Integração com Backend Python de Agendamento IA

**Feature Branch**: `Edilson-30-Dev`  
**Created**: 2026-08-06  
**Status**: Draft  
**Linear Ticket**: EDI-30  
**Input**: Refatorar o chat para substituir a integração atual com o BFF pelo novo backend Python da API de Agendamento IA, e adicionar um painel administrador para ingestão de regras de negócio na base RAG.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante conversa com a IA via novo backend Python (Priority: P1)

Um visitante na landing page abre o widget de chat, digita uma mensagem e recebe uma resposta da IA processada pelo novo backend Python de Agendamento IA, sem perceber nenhuma diferença visual ou funcional na interface.

**Why this priority**: A conversa é o fluxo principal do chat. Sem替换 o backend, o chat permaneceria com o BFF anterior. Esta é a mudança central da feature — todas as demais histórias orbitam em torno dela.

**Independent Test**: Pode ser testado abrindo o widget, digitando "Olá, gostaria de agendar um corte de cabelo", e verificando que a resposta vem do novo endpoint `POST /api/v1/chat` e é exibida corretamente na interface como mensagem da IA.

**Acceptance Scenarios**:

1. **Given** o visitante abre o widget de chat em qualquer página, **When** ele digita uma mensagem de texto e a envia, **Then** o sistema envia uma requisição `POST` para o endpoint `/api/v1/chat` do backend Python com o corpo `{ "message": "<texto>", "thread_id": "<id>" }` e o header `X-Tenant-ID`.
2. **Given** o backend Python retorna sucesso com `{ "status": "success", "response": "<resposta>" }`, **When** o frontend processa a resposta, **Then** a resposta da IA é exibida no chat como mensagem da assistente, alinhada à esquerda, sem alteração visual em relação ao comportamento atual.
3. **Given** o backend Python retorna erro HTTP 500, **When** o frontend processa a resposta, **Then** o sistema exibe uma mensagem de erro amigável ao usuário ("Erro interno no motor de IA. Nossa equipe foi notificada.") e permite reenvio.
4. **Given** o backend Python retorna erro HTTP 504 (timeout), **When** o frontend processa a resposta, **Then** o sistema exibe mensagem informando que o serviço demorou para responder e sugere tentar novamente.
5. **Given** o visitante envia múltiplas mensagens na mesma sessão, **When** cada requisição é feita, **Then** o mesmo `thread_id` é usado em todas as requisições daquela sessão para manter continuidade da conversa no backend.

---

### User Story 2 - Gerenciamento de thread_id via localStorage (Priority: P1)

O sistema precisa gerar e persistir um identificador único de conversa (`thread_id`) para cada visitante, garantindo que a IA mantenha contexto entre mensagens e entre recargas de página.

**Why this priority**: Sem `thread_id`, cada mensagem seria tratada como uma nova conversa pelo backend, perdendo todo o contexto. É pré-requisito para o funcionamento correto do chat.

**Independent Test**: Pode ser testado abrindo o chat, verificando no `localStorage` que um `thread_id` (UUID v4) foi gerado, recarregando a página e confirmando que o mesmo `thread_id` é mantido.

**Acceptance Scenarios**:

1. **Given** o visitante acessa o site pela primeira vez, **When** o chat é inicializado, **Then** o sistema gera um UUID v4, armazena em `localStorage` como `chat_thread_id` e o utiliza em todas as requisições ao backend.
2. **Given** o visitante já possui um `thread_id` salvo de uma visita anterior, **When** ele retorna ao site, **Then** o sistema recupera o `thread_id` existente do `localStorage` e o reutiliza — sem gerar um novo.
3. **Given** o `localStorage` está indisponível ou corrompido, **When** o sistema tenta acessar o `thread_id`, **Then** um novo UUID é gerado em memória para a sessão atual, e o chat continua funcionando normalmente (ainda que sem persistência entre recargas).

---

### User Story 3 - Configuração do X-Tenant-ID (Priority: P1)

Toda requisição ao backend Python deve incluir o header `X-Tenant-ID` que identifica qual cliente/empresa está utilizando o chat, permitindo que o backend acesse a base de conhecimento correta (RAG).

**Why this priority**: O `X-Tenant-ID` é obrigatório no backend e sem ele todas as requisições serão rejeitadas. É um requisito de segurança e multi-tenancy da API.

**Independent Test**: Pode ser testado configurando um `tenant_id` via variável de ambiente ou configuração, enviando uma mensagem e verificando no log de rede que o header `X-Tenant-ID` está presente com o valor correto.

**Acceptance Scenarios**:

1. **Given** que o `tenant_id` está configurado na aplicação (via variável de ambiente ou configuração), **When** qualquer requisição ao backend Python é feita, **Then** o header `X-Tenant-ID` é incluído automaticamente com o valor configurado.
2. **Given** que o `tenant_id` NÃO está configurado, **When** o sistema tenta enviar uma mensagem, **Then** o sistema exibe um erro claro informando que a configuração do tenant está ausente e orienta sobre como configurá-la.
3. **Given** que o `tenant_id` é alterado na configuração, **When** a próxima requisição é feita, **Then** o novo valor é utilizado — permitindo troca de tenant sem redeploy completo (hot-reload de config).

---

### User Story 4 - Painel Administrador para Ingestão de Regras de Negócio (Priority: P2)

Um administrador do sistema precisa de uma interface para enviar o texto institucional/regras de negócio de um cliente para vetorização na base RAG do backend Python, sem depender de ferramentas externas como Postman ou curl.

**Why this priority**: A ingestão de conhecimento é essencial para que a IA responda corretamente sobre cada empresa cliente, mas não bloqueia o funcionamento do chat (que pode operar com conhecimento já ingerido anteriormente). É prioridade P2 por ser fundamental para o valor do produto, mas não bloquear o fluxo principal de conversa.

**Independent Test**: Pode ser testado acessando a rota `/admin` (ou similar), preenchendo o campo de Tenant ID e a área de texto com regras de negócio, clicando em "Salvar e Vetorizar", e verificando que o backend retorna `201 Created` com status `processing`.

**Acceptance Scenarios**:

1. **Given** o administrador acessa a página de painel admin, **When** a página carrega, **Then** ele vê um formulário com: campo para `Tenant ID`, área de texto expandida para o conteúdo institucional, e um botão "Salvar e Vetorizar Base de Conhecimento".
2. **Given** o administrador preencheu Tenant ID e texto, **When** ele clica em "Salvar e Vetorizar", **Then** o sistema envia `POST /api/v1/ingest/text` com header `X-Tenant-ID` e corpo `{ "text_content": "<texto>" }`, e exibe feedback visual de carregamento.
3. **Given** o backend retorna `201 Created` com `{ "status": "processing" }`, **When** o frontend processa a resposta, **Then** o sistema exibe uma mensagem de sucesso: "Texto enviado para vetorização. O processamento está em andamento em segundo plano."
4. **Given** o backend retorna erro (400, 500, etc.), **When** o frontend processa a resposta, **Then** o sistema exibe a mensagem de erro retornada e permite correção e reenvio.
5. **Given** o administrador acessa o painel, **When** a página é carregada, **Then** o painel é exibido sem exigência de autenticação (v1 — autenticação será adicionada em fase futura).

---

### User Story 5 - Preservação da Experiência Visual e Funcional do Chat (Priority: P2)

Apesar da troca completa do backend de chat, o visitante NÃO deve perceber nenhuma diferença visual, funcional ou de performance na interface do widget. Todas as funcionalidades existentes do chat (abertura/fechamento, responsividade mobile, indicador de carregamento, scroll automático, design glassmorphism) devem continuar operando normalmente.

**Why this priority**: A regressão de UI seria percebida imediatamente pelo usuário final e comprometeria a qualidade do produto. É P2 porque a funcionalidade básica (P1) pode ser entregue antes da verificação completa de todos os modos visuais.

**Independent Test**: Pode ser testado percorrendo todos os cenários de aceitação do spec 005 (chatbot-ui-ux) e confirmando que todos continuam passando após a troca do backend.

**Acceptance Scenarios**:

1. **Given** o novo backend está integrado, **When** o visitante interage com o widget, **Then** o botão flutuante, animações de abertura/fechamento, diferenciação visual de mensagens (usuário vs IA), campo de texto expansível e indicador de carregamento funcionam exatamente como antes da troca.
2. **Given** o visitante usa dispositivo móvel (< 768px), **When** ele abre o chat, **Then** o chat continua exibido em tela cheia/bottom sheet, o teclado virtual não encobre a entrada, e o botão de fechar funciona corretamente.
3. **Given** o contrato de resposta do novo backend é diferente do anterior, **When** o frontend recebe a resposta, **Then** o mapeamento de campos (`response` → conteúdo da mensagem, `status: "success"` → indicação de sucesso) é feito corretamente sem quebrar a renderização.

---

### Edge Cases

- O que acontece quando o backend Python está offline (conexão recusada)? O sistema deve exibir erro de conexão e permitir reenvio.
- O que acontece quando o `localStorage` está cheio ou bloqueado (modo anônimo/privado)? O `thread_id` é gerado em memória, e o chat continua funcionando.
- O que acontece quando a resposta do backend excede o tamanho esperado (ex: resposta muito longa)? A área de conversa deve exibi-la integralmente com scroll.
- O que acontece quando o backend retorna um formato de resposta inesperado (ex: campo `response` ausente)? O sistema deve usar fallback e logar o erro.
- Como o sistema lida com timestamps de rede inconsistentes ou latência alta? O indicador de "digitando" permanece visível até o timeout ou resposta.
- O que acontece se dois administradores tentarem ingerir texto para o mesmo tenant simultaneamente? O backend processa normalmente; o frontend apenas reflete o resultado de cada requisição.
- Como o chat se comporta quando o `thread_id` expira no backend? O backend pode rejeitar com um erro específico; o frontend deve detectar e gerar novo `thread_id`.
- O que acontece com mensagens de áudio (funcionalidade existente do spec 006/007) após a troca de backend? Nesta versão (v1), o envio de áudio será **comentado/desabilitado** na UI — apenas chat por texto é suportado. O código de áudio permanece no repositório (comentado) para reativação futura quando o backend Python oferecer suporte.

## Requirements *(mandatory)*

### Functional Requirements

#### Integração com Backend Python (Chat)

- **FR-001**: O sistema DEVE substituir o endpoint de chat atual (`/chat/message` do BFF) pelo novo endpoint `POST /api/v1/chat` do backend Python, utilizando a base URL configurável via variável de ambiente (`NEXT_PUBLIC_PYTHON_BACKEND_URL`).
- **FR-002**: O sistema DEVE enviar o corpo da requisição no formato `{ "message": "<texto do usuário>", "thread_id": "<uuid da sessão>" }`, substituindo o formato anterior `{ "text": "..." }`.
- **FR-003**: O sistema DEVE incluir o header `X-Tenant-ID` em TODAS as requisições ao backend Python, com o valor proveniente da variável de ambiente `NEXT_PUBLIC_TENANT_ID`.
- **FR-004**: O sistema DEVE incluir o header `Content-Type: application/json` nas requisições de chat.
- **FR-005**: O sistema DEVE processar a resposta de sucesso do backend no formato `{ "tenant_id": "...", "status": "success", "response": "<texto>" }`, extraindo o campo `response` como conteúdo da mensagem da IA.
- **FR-006**: O sistema DEVE tratar explicitamente os erros HTTP 504 (Gateway Timeout) e 500 (Internal Server Error) com mensagens amigáveis ao usuário, conforme documentação do backend.

#### Gerenciamento de Sessão (thread_id)

- **FR-007**: O sistema DEVE gerar um UUID v4 como `thread_id` na primeira inicialização do chat quando nenhum `thread_id` existir no `localStorage`.
- **FR-008**: O sistema DEVE persistir o `thread_id` no `localStorage` sob a chave `chat_thread_id`.
- **FR-009**: O sistema DEVE recuperar e reutilizar o `thread_id` do `localStorage` em inicializações subsequentes do chat.
- **FR-010**: O sistema DEVE funcionar em modo degradado (UUID em memória, sem persistência) quando `localStorage` estiver indisponível, sem lançar erros.

#### Configuração de Tenant

- **FR-011**: O sistema DEVE ler o `tenant_id` da variável de ambiente `NEXT_PUBLIC_TENANT_ID` no momento do build e disponibilizá-lo como configuração de runtime.
- **FR-012**: O sistema DEVE validar que o `tenant_id` existe antes de permitir o envio de mensagens; se ausente, DEVE exibir mensagem de erro orientativa e bloquear o envio.

#### Painel Administrador (Ingestão de Conhecimento)

- **FR-013**: O sistema DEVE disponibilizar uma nova rota/página de painel administrador acessível via `/admin` (ou caminho configurável) para ingestão de regras de negócio.
- **FR-014**: A página de administração DEVE conter: campo de texto para `Tenant ID`, área de texto expandida (`<textarea>`) para conteúdo institucional, e botão "Salvar e Vetorizar Base de Conhecimento".
- **FR-015**: Ao submeter o formulário, o sistema DEVE enviar `POST /api/v1/ingest/text` com header `X-Tenant-ID` (do campo preenchido, não da variável de ambiente) e corpo `{ "text_content": "<texto>" }`.
- **FR-016**: O sistema DEVE exibir feedback visual de carregamento (loading) durante a requisição de ingestão.
- **FR-017**: Ao receber resposta `201 Created` com `status: "processing"`, o sistema DEVE exibir mensagem de sucesso informando que a vetorização está em processamento.
- **FR-018**: Em caso de erro na ingestão, o sistema DEVE exibir a mensagem de erro retornada pelo backend e permitir correção e reenvio.

#### Preservação da Experiência Existente

- **FR-019**: A troca do backend NÃO DEVE alterar a interface visual do widget de chat — todos os componentes visuais (`ChatWidget`, balões de mensagem, campo de texto, botões, animações) DEVEM permanecer inalterados.
- **FR-020**: O `ChatContext` e o hook `useChatAssistant` DEVEM ser adaptados para o novo backend sem quebrar a assinatura pública — componentes que consomem esses módulos NÃO DEVEM precisar de alterações.
- **FR-021**: O indicador de carregamento (`ChatStatus` / "IA está digitando...") DEVE continuar funcionando durante o processamento da requisição ao novo backend.
- **FR-022**: O sistema DEVE manter o tratamento de `prefers-reduced-motion` existente para todas as animações do chat.

#### Migração de Áudio (Desabilitação Temporária)

- **FR-025**: O botão de microfone e a funcionalidade de gravação/envio de áudio DEVEM ser desabilitados na UI do chat nesta versão (v1), mantendo o código-fonte comentado no repositório para reativação futura.
- **FR-026**: O sistema NÃO DEVE remover ou deletar os arquivos de serviço/hooks relacionados a áudio (`audioOptimization.ts`, `audioFromBase64.ts`, `sendAudioMessageToBff`); eles DEVEM permanecer no código (comentados onde necessário) para facilitar a reativação.

#### Observabilidade e Logs

- **FR-023**: O sistema DEVE registrar no console (ou sistema de logging do cliente) toda requisição ao backend Python com: `tenant_id`, `thread_id`, status HTTP, e `correlationId` (se presente na resposta).
- **FR-024**: Em caso de erro, o sistema DEVE logar detalhes suficientes para diagnóstico (status HTTP, corpo da resposta, mensagem de erro), sem expor dados sensíveis.

### Key Entities

- **PythonBackendConfig**: Configuração do backend Python. Atributos: `baseUrl` (string, ex: `http://localhost:8000`), `tenantId` (string, ex: `987654`). Proveniente de variáveis de ambiente.
- **ChatThreadSession**: Sessão de conversa do visitante. Atributos: `threadId` (UUID v4 string), persistido em `localStorage`. Gerenciado pelo hook de chat. Garante continuidade de contexto entre mensagens.
- **ChatApiRequest**: Requisição ao endpoint de chat. Atributos: `message` (texto do usuário), `thread_id` (UUID da sessão). Headers: `X-Tenant-ID`, `Content-Type: application/json`.
- **ChatApiResponse**: Resposta do endpoint de chat. Atributos: `tenant_id`, `status` ("success" ou erro), `response` (texto da IA). Mapeado para `ChatMessage` na UI.
- **KnowledgeBaseIngest**: Requisição de ingestão de conhecimento. Atributos: `tenant_id` (preenchido pelo admin), `text_content` (texto institucional). Endpoint: `POST /api/v1/ingest/text`.
- **IngestResponse**: Resposta da ingestão. Atributos: `tenant_id`, `status` ("processing"), `message` (descrição). Exibida como feedback ao admin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um visitante consegue enviar uma mensagem de texto e receber resposta da IA via novo backend Python em até 10 segundos (incluindo latência de rede) em condições normais de operação.
- **SC-002**: O `thread_id` é gerado e persistido corretamente em 100% das primeiras visitas, e recuperado em 100% das visitas subsequentes, validado por teste automatizado.
- **SC-003**: 100% das requisições ao backend Python incluem o header `X-Tenant-ID` com o valor configurado, validado por inspeção de logs de rede.
- **SC-004**: O painel administrador de ingestão permite que um administrador envie um texto de até 50.000 caracteres para vetorização e receba confirmação de processamento em até 5 segundos após o clique.
- **SC-005**: Nenhuma regressão visual ou funcional é detectada ao executar a suíte de testes existente do chat (specs 005, 006, 007, 008) após a troca do backend — 100% dos testes previamente aprovados continuam passando.
- **SC-006**: Erros de rede (conexão recusada, timeout, 500, 504) são tratados com mensagens amigáveis e o chat permanece funcional (permite reenvio) em 100% dos cenários de erro testados.
- **SC-007**: O administrador consegue realizar uma ingestão completa (preencher formulário, enviar, receber confirmação) em menos de 2 minutos na primeira tentativa, sem necessidade de documentação externa.

## Assumptions

- O backend Python está disponível na URL base configurada (`http://localhost:8000` para desenvolvimento) e implementa os endpoints `/api/v1/chat` e `/api/v1/ingest/text` conforme documentação do EDI-30.
- O formato de resposta do chat (`{ "status": "success", "response": "..." }`) é estável e não mudará sem aviso prévio.
- O `tenant_id` é conhecido no momento do build/deploy e não muda dinamicamente por usuário final (o chat é sempre para um tenant fixo).
- O painel administrador não requer autenticação na versão inicial (v1), operando como ferramenta interna. Autenticação será adicionada em fase futura.
- A funcionalidade de áudio (gravação e envio) será desabilitada na UI nesta versão (v1), com código mantido comentado. A reativação ocorrerá quando o backend Python oferecer suporte a entrada de áudio.
- As variáveis de ambiente `NEXT_PUBLIC_PYTHON_BACKEND_URL` e `NEXT_PUBLIC_TENANT_ID` serão configuradas no `.env` e `.env.example`.
- O design do painel administrador seguirá o tema dark/glassmorphism existente, consistente com o restante da aplicação.
- A estética "Tech/Glow" e os design tokens existentes serão reutilizados para o painel administrador, sem necessidade de novos tokens.
- O `ChatContext` e o `ChatProvider` existentes não precisam ser alterados em sua estrutura — apenas o hook `useChatAssistant` e o serviço `chatGateway` serão refatorados.
- Testes unitários existentes que validam o comportamento do chatGateway e useChatAssistant serão atualizados para refletir o novo contrato.
