# Tasks: Alinhamento do Chat Gateway com o Contrato Multimodal do BFF

**Input**: Design documents from `/specs/008-align-chat-bff-contract/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/chat-multimodal-bff-verification.md](./contracts/chat-multimodal-bff-verification.md)

**Tests**: Incluídos. A constituição do projeto (Princípio IV) torna testes obrigatórios; o contrato C1–C9 também os exige.

**Organization**: Tarefas agrupadas por user story (US1–US5) para entrega independente. MVP = US1 + US3 (texto + normalização canonical-first), pois US3 envolve mudanças no `chatGateway` que US1 também consome.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

Single project (Next.js App Router). Caminhos relativos à raiz do workspace `c:/projects/interasisai-web/`.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 [P] Documentar variável de ambiente em `.env.example` (criar se não existir) com `NEXT_PUBLIC_CHAT_BFF_ENDPOINT=http://localhost:3001/chat/message`.
- [X] T002 [P] Verificar e ajustar (se necessário) a CSP em `next.config.ts` para permitir `blob:` em `media-src` (suporte ao áudio de resposta via `URL.createObjectURL`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Reformular tipos e constantes antes de qualquer mudança em comportamento — todas as user stories dependem disso.

- [X] T003 Atualizar `src/services/chatGateway.types.ts`: adicionar constantes `MAX_TEXT_LENGTH = 4000` e `MAX_AUDIO_PAYLOAD_BYTES = 10 * 1024 * 1024`; redefinir `BffSuccessPayload` com campos canonical (`input_text`, `response_text`, `response_audio_base64`) e legados (`text`, `audio.{mimeType,contentBase64}`), `responseId`, `sessionId`, `correlationId`, `status`, `cache.{cacheable,source}`; redefinir `BffErrorPayload` com `status: "rejected"|"blocked"|"failed"`, `reason`, `error`, `message`; estender `ChatGatewaySuccess` com `audio?: { base64: string; mimeType: string }`, `responseId?`, `sessionId?`, `correlationId?`, `cache?: { cacheable: boolean; source?: string; cacheControl?: string }`; estender `ChatGatewayFailure` com `errorStatus?: "rejected"|"blocked"|"failed"|"local"`, `correlationId?`; tornar `originalDurationMs`/`optimizedDurationMs` opcionais e marcados como deprecated em `SendAudioMessageInput`; adicionar `text?: string` em `SendAudioMessageInput`.
- [X] T004 [P] Criar `src/services/audioFromBase64.ts` com `decodeAudioBase64(base64: string, mimeType: string): Blob` usando `atob` + `Uint8Array`; rejeita string vazia/inválida com erro tipado.
- [X] T005 [P] Criar `src/services/audioFromBase64.test.ts` cobrindo: base64 válido (`audio/mpeg`, `audio/wav`) → `Blob` com `type` e bytes corretos; base64 vazio → throw; base64 inválido (caracteres fora do alfabeto) → throw.
- [X] T006 [P] Criar `src/services/chatResponseCache.ts` com `Map<string, CachedReplyEntry>` interno; API `get(key)`, `set(key, entry, ttlMs)`, `clear()`; TTL via `expiresAt`; helper `buildRequestKey(text)` (DJB2 hash); helper `parseCacheControlMaxAgeMs(header)` que retorna `null` para `no-store`/ausente, `0` para `max-age=0`, valor em ms caso contrário (cap em 30 min).
- [X] T007 [P] Criar `src/services/chatResponseCache.test.ts`: `set`/`get`; expiração por TTL (`Date.now()` mockado); `parseCacheControlMaxAgeMs` para `"no-store"`, `"max-age=60"`, `"max-age=0"`, `"public, max-age=120"`, header ausente; `clear()` zera o map.
- [X] T008 Atualizar `src/services/index.ts` para reexportar `decodeAudioBase64`, `chatResponseCache` (objeto com `get`/`set`/`clear`) e os tipos `CachedReplyEntry`, `ChatGatewaySuccess` (já existente) revisado.

**Checkpoint**: tipos, helpers e cache prontos; user stories podem prosseguir.

---

## Phase 3: User Story 1 - Enviar texto pelo endpoint multimodal único (Priority: P1) 🎯 MVP

**Goal**: Texto sai no contrato exato (`POST /chat/message`, `application/json`, body `{text}`) com validações locais (vazio, > 4000) bloqueando a rede; resposta canonical-first é exibida ao usuário.

**Independent Test**: Digitar mensagem no chat e ver resposta da assistente; texto > 4000 chars não dispara `fetch`.

### Tests for User Story 1 ⚠️ (escrever primeiro, devem falhar)

- [X] T009 US1] Em `src/services/chatGateway.test.ts` adicionar/ajustar casos C1–C2: endpoint default `/chat/message` (singular); override por env e por `input.endpoint`; texto válido envia `POST` com `Content-Type: application/json`, body `{"text":"olá"}` (sem `kind`, sem `internalSecret`); trim aplicado; texto vazio → `{ ok:false, status:400, retryable:false, errorStatus:"local" }` sem `fetch`; texto com 4001 chars → `{ ok:false, status:413, retryable:false, errorStatus:"local" }` sem `fetch`; texto com 4000 chars → `fetch` chamado normalmente.
- [X] T010 US1] Em `src/services/chatGateway.test.ts` adicionar casos C5 (erros) para 400/403/429/502 com `reason` precedendo `error`/`message`, e classificação `retryable` correta (400/403 false; 429/502/0/408/5xx true).
- [X] T011 US1] Em `src/services/chatGateway.test.ts` adicionar casos C6: toda chamada de `fetch` recebe `credentials: "include"`; nenhum body JSON contém chave `internalSecret`.

### Implementation for User Story 1

- [X] T012 US1] Em `src/services/chatGateway.ts` mudar `DEFAULT_CHAT_ENDPOINT` para `"/chat/message"` (singular) preservando override por `process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT`.
- [X] T013 US1] Em `src/services/chatGateway.ts` reescrever `sendTextMessageToBff`: trim do `text`; retornar `buildFailure(400, "Mensagem de texto vazia.", { errorStatus: "local" })` se vazio; retornar `buildFailure(413, "A mensagem excede o limite máximo de 4000 caracteres.", { errorStatus: "local" })` se `text.length > MAX_TEXT_LENGTH`; body `JSON.stringify({ text })` (remover `kind`); manter `credentials: "include"` e `Content-Type: application/json`.
- [X] T014 US1] Em `src/services/chatGateway.ts` reescrever `getMessageFromErrorPayload` para preferir `payload.reason` antes de `payload.error` e `payload.message`; reescrever `isRetryableStatus` para `status === 0 || status === 408 || status === 429 || (status >= 500 && status !== 501)` (mantendo comportamento atual para 5xx; 501 raramente é transitório, mas pelo plano D7 mantém-se `>= 500` simples — usar `>= 500`); ajustar `buildFailure` para aceitar `errorStatus?` e `correlationId?` opcionais e retornar em `ChatGatewayFailure`.
- [X] T015 US1] Em `src/services/chatGateway.ts` ajustar `normalizeBffResponse` (caminho de erro): derivar `errorStatus` por status HTTP quando body não trouxer (`400 → "rejected"`, `403 → "blocked"`, `5xx/502 → "failed"`); propagar `correlationId` do `BffErrorPayload` quando presente.

**Checkpoint**: US1 totalmente funcional para texto.

---

## Phase 4: User Story 3 - Compatibilidade do contrato de resposta (Priority: P2)

> Implementada antes da US2 e US5 porque a normalização canonical-first é compartilhada.

**Goal**: `normalizeBffResponse` consome `response_text` com fallback `text`; expõe `responseId`, `sessionId`, `correlationId`, `cache` em sucesso; mantém retrocompatibilidade.

**Independent Test**: Resposta com ambos os campos canonical e legados → frontend usa canonical.

### Tests for User Story 3 ⚠️

- [X] T016 US3] Em `src/services/chatGateway.test.ts` adicionar casos C4 (sucesso): `{ response_text: "A", text: "B" }` → `result.reply === "A"`; somente `{ text: "B" }` → `"B"`; `{}` → fallback `"Recebemos sua mensagem e já estamos processando."`; `responseId`/`sessionId`/`correlationId` propagados; bloco `cache` propagado em `result.cache`; header `Cache-Control` propagado em `result.cache.cacheControl`.

### Implementation for User Story 3

- [X] T017 US3] Em `src/services/chatGateway.ts` reescrever `normalizeBffResponse` (caminho de sucesso): `reply = payload.response_text?.trim() || payload.text?.trim() || fallback`; ler `responseId`, `sessionId`, `correlationId`, `status` do payload; montar `cache` com `cacheable` (default `false`), `source`, `cacheControl: response.headers.get("Cache-Control") || undefined`; retornar `ChatGatewaySuccess` estendido.

**Checkpoint**: US1 + US3 entregam o MVP funcional para texto com canonical-first.

---

## Phase 5: User Story 5 - Reprodução do áudio de resposta (Priority: P2)

**Goal**: Quando a resposta do BFF traz áudio em Base64, o frontend disponibiliza um `Blob`/`URL` reproduzível ao usuário.

**Independent Test**: Resposta com `response_audio_base64` → hook expõe `audioReplyBlob` (instância de `Blob`) e `audioReplyUrl` (`blob:...`).

### Tests for User Story 5 ⚠️

- [X] T018 US5] Em `src/services/chatGateway.test.ts` adicionar casos C4 (áudio): `{ response_audio_base64: "X", audio: { mimeType: "audio/wav", contentBase64: "Y" } }` → `result.audio === { base64: "X", mimeType: "audio/wav" }`; `{ audio: { contentBase64: "Y" } }` → `{ base64: "Y", mimeType: "audio/mpeg" }`; `{ response_audio_base64: "X" }` → `{ base64: "X", mimeType: "audio/mpeg" }`; sem áudio → `result.audio === undefined`.
- [X] T019 [P] US5] Em `src/hooks/useChatAssistant.test.ts` adicionar casos C9: sucesso com áudio → `audioReplyBlob` é `Blob` com `type` correto e `audioReplyUrl` é string `blob:`; sucesso sem áudio → `audioReplyBlob: null`, `audioReplyUrl: null`; ao trocar resposta, `URL.revokeObjectURL` é chamado para a URL anterior; ao desmontar o hook, `URL.revokeObjectURL` é chamado para a URL atual.

### Implementation for User Story 5

- [X] T020 US5] Em `src/services/chatGateway.ts` (continuação do `normalizeBffResponse` de sucesso) montar `audio` quando `payload.response_audio_base64?.trim()` ou `payload.audio?.contentBase64?.trim()` presente: `{ base64: <preferido>, mimeType: payload.audio?.mimeType || "audio/mpeg" }`; ausente → `undefined`.
- [X] T021 US5] Em `src/hooks/useChatAssistant.ts` adicionar estados `audioReplyBlob: Blob | null` e `audioReplyUrl: string | null`; em `handleGatewayResult`, quando `result.ok && result.audio`, decodificar via `decodeAudioBase64`, criar URL via `URL.createObjectURL`, armazenar nos refs/states; revogar URL anterior antes de substituir; em `useEffect` de cleanup do hook, revogar a URL atual ao desmontar; expor no retorno do hook.

**Checkpoint**: US5 funcional independente; pode ser consumida (ou não) pela UI.

---

## Phase 6: User Story 2 - Enviar áudio (com texto opcional) (Priority: P1)

**Goal**: Áudio sai como multipart com `audio` (Blob) e opcional `text`; sem `kind`/durações; sem `Content-Type` manual; bloqueio local para áudio vazio (400) e > 10 MB (413).

**Independent Test**: Gravar voz, enviar; conferir multipart correto; áudio > 10 MB não dispara `fetch`.

### Tests for User Story 2 ⚠️

- [X] T022 US2] Em `src/services/chatGateway.test.ts` adicionar casos C3: áudio webm/mp4/wav/octet-stream → filename `recording.webm`/`.mp4`/`.wav`/`.bin`; FormData contém `audio`; **não** contém `kind`, `originalDurationMs`, `optimizedDurationMs`; `text` opcional não vazio anexado como part `text`; `text` apenas com espaços → não anexar; áudio com `size:0` → sem `fetch`, `status:400`; áudio > 10 MB → sem `fetch`, `status:413`; áudio = 10 MB → `fetch` chamado; sem header `Content-Type` manual nas opções de `fetch`.

### Implementation for User Story 2

- [X] T023 US2] Em `src/services/chatGateway.ts` adicionar helper interno `getAudioFilename(blobType: string): string` mapeando `audio/webm*` → `"recording.webm"`, `audio/mp4*` → `"recording.mp4"`, `audio/wav*` → `"recording.wav"`, fallback → `"recording.bin"`.
- [X] T024 US2] Em `src/services/chatGateway.ts` reescrever `sendAudioMessageToBff`: validar `audio.size <= 0` → `buildFailure(400, "Áudio inválido para envio.", { errorStatus: "local" })`; validar `audio.size > MAX_AUDIO_PAYLOAD_BYTES` → `buildFailure(413, "O áudio excede o tamanho máximo permitido (10 MB).", { errorStatus: "local" })`; remover validação de durações; montar `FormData` com `audio` (filename via helper) e, se `input.text?.trim()` não vazio, anexar part `text` com valor trimado; `fetch` com `method:"POST"`, `credentials:"include"`, body `formData`, **sem** header `Content-Type`.
- [X] T025 US2] Em `src/hooks/useChatAssistant.ts` ajustar `sendOptimizedAudio` para chamar `sendAudioMessageToBff({ audio: optimized.optimizedBlob })` (sem `originalDurationMs`/`optimizedDurationMs`); manter `console.info("[Audio Optimization]", { ... })` com as durações; remover qualquer referência a campos de duração no payload.
- [X] T026 US2] Em `src/hooks/useChatAssistant.test.ts` ajustar mocks/asserções para o novo payload de áudio (sem durações no `FormData`); manter cobertura de retry recuperável e estado de erro.

**Checkpoint**: US1 + US2 + US3 + US5 funcionais.

---

## Phase 7: User Story 4 - Boas práticas de captura de áudio (Priority: P3)

**Goal**: Captura WebM/Opus (Chrome/Edge) ou MP4 (Safari); sem Base64 no upload; respeitar limite prático.

**Independent Test**: Validar que `getSupportedMimeType` retorna formato suportado e que `chatGateway` envia o `Blob` original.

### Implementation for User Story 4

- [X] T027 [P] US4] Verificar em `src/hooks/useChatAssistant.ts` que `getSupportedMimeType` continua priorizando `audio/webm` e cai em `audio/mp4`; nenhuma alteração funcional esperada (apenas confirmação por revisão).
- [X] T028 [P] US4] Em `src/hooks/useChatAssistant.test.ts` garantir cenário onde `MediaRecorder.isTypeSupported` retorna `true` apenas para `audio/mp4` (Safari) → fluxo de envio usa Blob `audio/mp4` e gateway gera filename `.mp4` (cobertura cruzada com T022).

**Checkpoint**: todas as user stories funcionais.

---

## Phase 8: Cross-cutting — Cache, Observabilidade, Erros mapeados

> Funcionalidades transversais (FR-018/FR-019/FR-020/FR-021) que tocam US1, US3 e US5.

### Tests

- [X] T029 Em `src/services/chatGateway.test.ts` adicionar casos C7 (cache em memória):
  - Texto idêntico, resposta `Cache-Control: max-age=60` + `cache.cacheable:true` → 2ª chamada não dispara `fetch`; resposta vem do cache com mesmo `reply`/`audio`.
  - Resposta `Cache-Control: no-store` → 2ª chamada dispara `fetch`.
  - Resposta `cache.cacheable:false` → 2ª chamada dispara `fetch`.
  - `max-age=0` → 2ª chamada dispara `fetch`.
  - Áudio (request) → nunca cacheia (2ª chamada idêntica dispara `fetch`).
  - Resposta de erro → nunca cacheia.
  - Spy em `localStorage.setItem`/`sessionStorage.setItem` confirma 0 chamadas.

### Implementation

- [X] T030 Em `src/services/chatGateway.ts` integrar `chatResponseCache`: em `sendTextMessageToBff`, antes do `fetch`, calcular `key = buildRequestKey(text)` e tentar `chatResponseCache.get(key)` — se hit, retornar `ChatGatewaySuccess` reconstruído (`status: 200`, `cache: { cacheable: true, source: "client", cacheControl: <preservado> }`); após resposta de sucesso, se `Cache-Control` produzir `ttlMs > 0` E `payload.cache?.cacheable === true`, chamar `chatResponseCache.set(key, { reply, audio, expiresAt: Date.now()+ttlMs, responseId }, ttlMs)`.
- [X] T031 [P] Em `src/hooks/useChatAssistant.ts` adicionar `console.info("[ChatGateway]", { correlationId, responseId, sessionId, status, cacheable })` em `handleGatewayResult` para sucesso e `console.error("[ChatGateway:error]", { correlationId, status, errorStatus, message })` para falha; não bloquear render se IDs ausentes (logar `unknown`/`null`).
- [X] T032 [P] Em `src/hooks/useChatAssistant.test.ts` adicionar casos: log `console.info` com `[ChatGateway]` contém `correlationId` da resposta; log `console.error` com `[ChatGateway:error]` em falha 502 contém `errorStatus: "failed"`.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T033 P] Atualizar `src/components/chat/ChatWidget.tsx` apenas se necessário para garantir que mensagens de erro de validação local (4000 chars, 10 MB) sejam exibidas consistentemente via `audioError`/estado existente; **não** adicionar campo de texto opcional para áudio (FR-005 limita à camada de serviço).
- [ ] T034 P] Atualizar `src/components/chat/ChatWidget.test.tsx` se T033 modificar a UI; caso contrário, marcar como N/A.
- [ ] T035 Rodar `npm test` localmente e garantir suíte verde antes do merge.
- [ ] T036 Rodar `quickstart.md` (passos 3, 4, 6, 7, 9, 10) contra o BFF local em `http://localhost:3001/chat/message` e registrar evidências (Network screenshots ou logs) na PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sem dependências.
- **Phase 2 (Foundational)**: depende de Phase 1; **bloqueia** todas as user stories. T003 bloqueia T004–T008 só conceitualmente (tipos compartilhados); na prática T004–T007 podem ir em paralelo após T003 (são arquivos novos independentes).
- **Phase 3 (US1)**: depende de Phase 2.
- **Phase 4 (US3)**: depende de Phase 2; recomendada antes de US2 e US5 porque atualiza `normalizeBffResponse` (caminho de sucesso).
- **Phase 5 (US5)**: depende de Phase 4 (consome `result.audio` produzido por T020) e Phase 2 (T004 `audioFromBase64`).
- **Phase 6 (US2)**: depende de Phase 2; pode ser paralela a US3/US5 desde que cada um trabalhe em fluxos diferentes (`sendTextMessageToBff` vs `sendAudioMessageToBff`).
- **Phase 7 (US4)**: depende de Phase 2 e parcialmente de US2 (cobertura cruzada).
- **Phase 8 (cross-cutting)**: depende de US1 e US3 concluídas.
- **Phase 9 (Polish)**: depende de todas as anteriores.

### Within Each User Story

- Testes (marcados antes da seção Implementation) são escritos primeiro e devem **falhar** antes da implementação.
- Tipos antes de serviços; serviços antes de hook.
- Story completa antes de mover para a próxima prioridade dentro do mesmo desenvolvedor.

### Parallel Opportunities

- T001 ‖ T002 (Phase 1).
- T004 ‖ T005 ‖ T006 ‖ T007 (após T003).
- T009 ‖ T010 ‖ T011 (escrita de testes US1 — mesmo arquivo, mas blocos `describe` independentes; preferir sequencial por simplicidade).
- T019 ‖ T022 (US5 hook test e US2 gateway test — arquivos diferentes).
- T027 ‖ T028 (US4).
- T031 ‖ T032 ‖ T033 ‖ T034.

---

## Parallel Example: Foundational

```bash
# Após T003 (tipos), em paralelo:
Task T004: Criar src/services/audioFromBase64.ts
Task T005: Criar src/services/audioFromBase64.test.ts
Task T006: Criar src/services/chatResponseCache.ts
Task T007: Criar src/services/chatResponseCache.test.ts
```

## Parallel Example: User Story 5

```bash
# Após T020 (gateway expõe result.audio):
Task T019: Atualizar src/hooks/useChatAssistant.test.ts (audioReplyBlob/audioReplyUrl)
# Em paralelo, T022 (US2) pode começar pois é outro arquivo de testes:
Task T022: Atualizar src/services/chatGateway.test.ts (multipart)
```

---

## Independent Test Criteria (recap)

| Story | Validação independente |
|-------|------------------------|
| **US1 (P1)** | Texto enviado em `POST /chat/message` JSON `{text}` sem `kind`; texto vazio e > 4000 bloqueados localmente. |
| **US2 (P1)** | Áudio enviado em multipart com `audio` (filename derivado do MIME), sem `kind`/durações; áudio vazio e > 10 MB bloqueados localmente. |
| **US3 (P2)** | Resposta com `response_text` tem precedência sobre `text`; `responseId`/`sessionId`/`correlationId`/`cache` propagados. |
| **US4 (P3)** | `getSupportedMimeType` cobre Chrome/Edge (webm) e Safari (mp4); upload sem Base64. |
| **US5 (P2)** | `audioReplyBlob` e `audioReplyUrl` expostos pelo hook quando resposta traz áudio; URL revogada em substituição/desmontagem. |

## Suggested MVP Scope

**MVP** = Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US3). Garante o caminho de texto end-to-end com canonical-first, validação local de 4000 chars, mapa de erros e propagação de IDs — entregando valor mensurável (SC-001, SC-002, SC-008, SC-009, SC-010 e SC-012).

## Format Validation

- ✅ Todas as tarefas começam com `- [ ]`.
- ✅ IDs sequenciais T001–T036.
- ✅ Tarefas paralelas marcadas com `[P]` (arquivos diferentes, sem dependências bloqueantes).
- ✅ Tarefas de fase de user story marcadas com `[US1]`/`[US2]`/`[US3]`/`[US4]`/`[US5]`.
- ✅ Setup, Foundational e Polish **sem** label de story.
- ✅ Caminhos de arquivo explícitos em todas as tarefas de implementação.
