# Feature Specification: Gravação de Áudio no Frontend (EDI-20 Parte A)

**Feature Branch**: `006-edi-20-audio-frontend`  
**Created**: 2026-04-21  
**Status**: Draft  
**Linear Task**: [EDI-20](https://linear.app/edilsonandrade/issue/EDI-20/implementar-gravacao-de-audio-e-setup-do-backend-orquestrador) — Parte A (Frontend)

---

## Contexto & Escopo

Esta especificação cobre **exclusivamente a camada frontend** da tarefa EDI-20.

O objetivo é tornar o botão de microfone do widget de chat funcional: o usuário clica, o navegador solicita permissão, o áudio é capturado via `MediaRecorder API`, e ao parar a gravação um `Blob` de áudio é gerado e disponibilizado para envio ao backend.

**Fora do escopo desta spec:**
- Transcrição de áudio (speech-to-text)
- Backend NestJS (EDI-20 Parte B — spec separada)
- Reprodução do áudio gravado
- Integração HTTP com o servidor (o envio do Blob é um contrato a ser preenchido quando o backend estiver pronto)

---

## User Scenarios & Testing

### User Story 1 — Gravar e enviar mensagem de voz (Priority: P1)

O usuário está no widget de chat e deseja enviar uma mensagem falada em vez de digitar. Ele clica no botão de microfone, fala sua mensagem, clica novamente para parar, e o sistema gera o arquivo de áudio pronto para envio à IA.

**Why this priority**: É o fluxo principal da feature — sem ele a feature não existe.

**Independent Test**: Pode ser testado completamente no browser: abrir o chat, clicar no microfone, falar "teste", parar a gravação, e verificar no console que um `Blob` com `size > 0` foi gerado.

**Acceptance Scenarios**:

1. **Given** o widget de chat está aberto, **When** o usuário clica no botão de microfone, **Then** o navegador exibe o diálogo de permissão de microfone.
2. **Given** a permissão foi concedida, **When** o usuário clica no microfone, **Then** o ícone muda de estado (visual de "gravando"), um timer começa a contar segundos no UI, e o estado `isRecording` passa a `true`.
3. **Given** o usuário está gravando, **When** clica novamente no microfone, **Then** a gravação para, o timer para, e um `Blob` de áudio é gerado com `size > 0`.
4. **Given** o Blob foi gerado com sucesso, **Then** o Blob é disponibilizado via `audioBlob` no hook e logado no console como `[Audio Blob] size: X bytes`.
5. **Given** a gravação parou, **Then** o estado `isRecording` volta a `false` e o UI retorna ao estado normal.

---

### User Story 2 — Permissão de microfone negada (Priority: P2)

O usuário clica no microfone mas nega a permissão no navegador (ou ela foi bloqueada previamente). O sistema deve informar o problema sem travar ou quebrar o chat.

**Why this priority**: Tratamento de erro é crítico para UX — o usuário precisa entender o que aconteceu.

**Independent Test**: Pode ser testado bloqueando a permissão de microfone nas configurações do navegador antes de clicar no ícone.

**Acceptance Scenarios**:

1. **Given** a permissão do microfone está negada, **When** o usuário clica no botão de microfone, **Then** uma mensagem de erro é exibida no chat: "Permissão de microfone necessária".
2. **Given** o erro foi exibido, **Then** o estado `isRecording` permanece `false` e o botão volta ao estado normal.
3. **Given** o erro foi exibido, **Then** a mensagem usa `aria-live="assertive"` para ser anunciada por leitores de tela.

---

### User Story 3 — Feedback visual durante gravação (Priority: P3)

Enquanto o usuário está gravando, o UI deve comunicar claramente o estado ativo da gravação com indicadores visuais (ícone, timer, animação).

**Why this priority**: Melhora de UX — o usuário precisa saber que a gravação está ativa para falar no momento certo.

**Independent Test**: Pode ser testado visualmente — verificar que após clicar no microfone o ícone muda, o timer aparece e o botão pulsa.

**Acceptance Scenarios**:

1. **Given** `isRecording` é `true`, **Then** o ícone de microfone muda para `MicOff` (indica "clique para parar").
2. **Given** `isRecording` é `true`, **Then** um timer em formato `MM:SS` é exibido ao lado ou abaixo do botão (ex: `0:05`).
3. **Given** `isRecording` é `true`, **Then** o botão exibe uma animação de pulso (`animate-pulse`) que respeita `prefers-reduced-motion`.
4. **Given** o usuário prefere movimento reduzido (`prefers-reduced-motion: reduce`), **Then** a animação de pulso é suprimida via `motion-reduce:animate-none`.

---

### Edge Cases

- O que acontece se o usuário fechar o painel de chat durante uma gravação ativa? → A gravação deve ser interrompida e o stream de microfone deve ser liberado.
- O que acontece se o `MediaRecorder` não for suportado pelo navegador? → Exibir mensagem "Gravação de áudio não suportada neste navegador" e não mostrar o botão de microfone.
- O que acontece se o usuário gravar um áudio de 0 segundos (clica e imediatamente para)? → O Blob pode ter `size === 0`; o hook não deve emitir o Blob e deve descartar silenciosamente.
- O que acontece se houver erro durante a gravação (microfone desconectado)? → Capturar o evento `onerror` do `MediaRecorder`, parar a gravação e exibir mensagem de erro.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE solicitar permissão de microfone via `navigator.mediaDevices.getUserMedia({ audio: true })` ao iniciar gravação.
- **FR-002**: O sistema DEVE usar a `MediaRecorder API` para capturar o áudio em chunks enquanto `isRecording` for `true`.
- **FR-003**: O hook `useChatAssistant` DEVE expor os estados `isRecording: boolean`, `audioBlob: Blob | null`, e `recordingTime: number` (segundos).
- **FR-004**: Ao parar a gravação, o sistema DEVE consolidar todos os chunks em um único `Blob` do tipo `audio/webm` (com fallback para `audio/mp4` se `audio/webm` não for suportado).
- **FR-005**: O `audioBlob` resultante DEVE ter `size > 0` para ser considerado válido; blobs inválidos (`size === 0`) DEVEM ser descartados.
- **FR-006**: O `audioBlob` válido DEVE ser logado no console como `[Audio Blob] size: X bytes` (comportamento temporário até a integração com backend).
- **FR-007**: O hook DEVE expor as ações `startRecording(): void` e `stopRecording(): void`.
- **FR-008**: O timer de gravação (`recordingTime`) DEVE incrementar a cada segundo enquanto `isRecording` for `true`, usando `setInterval`; DEVE ser zerado ao iniciar nova gravação.
- **FR-009**: O componente `ChatWidget` DEVE exibir o timer em formato `M:SS` enquanto `isRecording` for `true`.
- **FR-010**: O componente `ChatWidget` DEVE usar o ícone `Mic` (parado) e `MicOff` (gravando) de `lucide-react`.
- **FR-011**: O botão de microfone DEVE aplicar `animate-pulse` e `motion-reduce:animate-none` enquanto `isRecording` for `true`.
- **FR-012**: Quando a permissão for negada, o hook DEVE definir `audioError: "Permissão de microfone necessária"` e `isRecording: false`.
- **FR-013**: Quando `MediaRecorder` não for suportado pelo navegador (`typeof MediaRecorder === 'undefined'`), o hook DEVE definir `audioError` com mensagem adequada e não iniciar gravação.
- **FR-014**: Ao fechar o painel de chat (`isOpen` = `false`), se houver gravação ativa, `stopRecording()` DEVE ser chamado automaticamente para liberar o stream do microfone.
- **FR-015**: O `audioBlob` DEVE ser exposto pelo hook para consumo futuro por uma camada de serviço (o envio HTTP ao backend é responsabilidade de uma função externa `sendAudioToBackend(blob: Blob)` — a ser implementada quando o backend estiver disponível).

### Key Entities

- **AudioBlob**: Arquivo binário de áudio gerado pela `MediaRecorder API`. Atributos: `data: Blob`, `size: number`, `mimeType: "audio/webm" | "audio/mp4"`.
- **RecordingSession**: Estado transitório de uma gravação ativa. Atributos: `isRecording: boolean`, `recordingTime: number` (segundos), `chunks: BlobPart[]`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Ao clicar no microfone, o diálogo de permissão do navegador aparece em menos de 500ms.
- **SC-002**: O timer de gravação exibe o tempo correto (incrementa a cada 1 segundo com erro máximo de ±100ms).
- **SC-003**: Ao parar a gravação após falar por pelo menos 1 segundo, o Blob gerado tem `size > 0`.
- **SC-004**: Em 100% dos casos de permissão negada, o usuário vê uma mensagem de erro clara sem refresh de página.
- **SC-005**: Ao fechar o painel durante gravação ativa, o ícone de microfone do sistema operacional (indicador de uso do microfone) é desativado — confirmando que o stream foi liberado.
- **SC-006**: Todos os testes unitários do hook `useChatAssistant` passam com cobertura de `startRecording`, `stopRecording`, `recordingTime` e `audioError`.

---

## Assumptions

- O navegador alvo é Chrome 88+ / Edge 88+ / Firefox 86+ — todos suportam `MediaRecorder API` com `audio/webm`.
- Safari (iOS/macOS) pode requerer `audio/mp4` — o fallback via `MediaRecorder.isTypeSupported()` cobre esse caso.
- A integração HTTP (envio do Blob ao backend) é um contrato futuro — esta spec não define o endpoint, headers ou formato de request.
- O `useChatAssistant` hook já existe em `src/hooks/useChatAssistant.ts` — esta spec refina e substitui a lógica de áudio existente (que atualmente usa `SpeechRecognition`).
- O componente `ChatWidget` já existe em `src/components/chat/ChatWidget.tsx` — apenas a seção do botão de microfone e a área de input serão modificadas.
- A interface do `ChatMessage` e o `ChatContext` permanecem inalterados.
- Testes unitários são obrigatórios (princípio IV da constituição do projeto) — `MediaRecorder` deve ser mockado globalmente nos testes Jest.
