# Phase 1 Data Model — Alinhamento do Chat Gateway com o Contrato Multimodal do BFF

**Feature**: 008-align-chat-bff-contract
**Date**: 2026-04-30

> Modelo funcional. Tipos TypeScript reais ficam em [src/services/chatGateway.types.ts](../../src/services/chatGateway.types.ts).

## Constantes

| Constante | Valor | Origem |
|-----------|-------|--------|
| `MAX_TEXT_LENGTH` | `4000` | FR-017, contrato BFF |
| `MAX_AUDIO_PAYLOAD_BYTES` | `10 * 1024 * 1024` | FR-013, contrato BFF |
| `DEFAULT_AUDIO_REPLY_MIME` | `"audio/mpeg"` | D8 |

## Entidades

### 1. `TextMessageRequest`

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `endpoint` | string | Não | Override do endpoint. Default: env `NEXT_PUBLIC_CHAT_BFF_ENDPOINT` ou `/chat/message`. |
| `text` | string | Sim | Após `trim()`: `1 ≤ len ≤ 4000`. |

**HTTP**:

- `POST {endpoint}`
- Headers: `Content-Type: application/json`
- Body: `{ "text": <text trimado> }`
- `credentials: "include"`

### 2. `AudioMessageRequest`

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `endpoint` | string | Não | Igual ao texto. |
| `audio` | Blob | Sim | `0 < size ≤ 10_485_760`. MIME: `audio/webm*`, `audio/mp4*`, `audio/wav*`. |
| `text` | string | Não | Quando presente: `trim().length > 0` (e ≤ 4000); senão descartar. |

**HTTP**:

- `POST {endpoint}` — sem `Content-Type` manual.
- Body: `FormData` com part `audio` (filename derivado do MIME) e opcionalmente `text`.
- `credentials: "include"`.

### 3. `BffSuccessPayload` (resposta JSON 2xx)

Campos coexistem (canonical + legado):

| Campo | Tipo | Origem |
|-------|------|--------|
| `input_text` | string? | canonical |
| `response_text` | string? | canonical (preferido) |
| `response_audio_base64` | string? | canonical (preferido) |
| `text` | string? | legado |
| `audio.mimeType` | string? | legado |
| `audio.contentBase64` | string? | legado |
| `status` | `"completed"` | comum |
| `responseId` | string? | comum |
| `sessionId` | string? | comum |
| `correlationId` | string? | comum |
| `cache.cacheable` | boolean? | comum |
| `cache.source` | `"engine" \| "client"`? | comum |

### 4. `BffErrorPayload` (resposta JSON ≥ 400)

| Campo | Tipo | Notas |
|-------|------|-------|
| `status` | `"rejected" \| "blocked" \| "failed"`? | semântica do BFF |
| `reason` | string? | precedência sobre `error`/`message` |
| `error` | string? | legado |
| `message` | string? | legado |

### 5. `ChatGatewaySuccess` (resultado normalizado)

| Campo | Tipo | Regras |
|-------|------|--------|
| `ok` | `true` | discriminador |
| `reply` | string | `response_text ?? text ?? fallback` |
| `audio` | `{ base64: string; mimeType: string } \| undefined` | quando `response_audio_base64 ?? audio.contentBase64` presente; `mimeType = audio.mimeType ?? "audio/mpeg"` |
| `responseId` | string? | propagado |
| `sessionId` | string? | propagado |
| `correlationId` | string? | propagado |
| `cache` | `{ cacheable: boolean; source?: string; cacheControl?: string } \| undefined` | construído a partir do bloco `cache` do body + header `Cache-Control` |
| `status` | number | HTTP status |
| `raw` | unknown | body bruto |

### 6. `ChatGatewayFailure`

| Campo | Tipo | Regras |
|-------|------|--------|
| `ok` | `false` | discriminador |
| `status` | number | `0` (rede), `400` (vazio/inválido), `413` (excede limites), demais do servidor |
| `errorStatus` | `"rejected" \| "blocked" \| "failed" \| "local"`? | derivado do body ou `"local"` em validações locais |
| `message` | string | `reason ?? error ?? message ?? fallback` |
| `retryable` | boolean | `true` para `0`, `408`, `429`, `>= 500`; `false` para `400`, `403`, `413` |
| `correlationId` | string? | quando presente no body de erro |
| `raw` | unknown | body ou metadados de validação local |

### 7. `ChatGatewayResult`

União discriminada `ChatGatewaySuccess | ChatGatewayFailure`.

### 8. `CachedReplyEntry` (interno do `chatResponseCache`)

| Campo | Tipo | Notas |
|-------|------|-------|
| `reply` | string | corpo a reusar |
| `audio` | `{ base64: string; mimeType: string } \| undefined` | opcional |
| `expiresAt` | number | epoch ms; `Date.now() + maxAgeMs` |
| `responseId` | string? | propagado para logs |

## Regras de validação (frontend)

| Regra | Onde | Resultado |
|-------|------|-----------|
| Texto vazio | `sendTextMessageToBff` | `status: 400`, `retryable: false`, `errorStatus: "local"` |
| Texto > 4000 chars | `sendTextMessageToBff` | `status: 413`, `retryable: false`, `errorStatus: "local"` |
| Áudio vazio | `sendAudioMessageToBff` | `status: 400`, `retryable: false`, `errorStatus: "local"` |
| Áudio > 10 MB | `sendAudioMessageToBff` | `status: 413`, `retryable: false`, `errorStatus: "local"` |
| Texto adicional vazio em áudio | `sendAudioMessageToBff` | descartar silenciosamente (não anexar `text`) |
| Falha de rede (`fetch` lança) | catch | `status: 0`, `retryable: true` |

## Mapa de status HTTP do servidor

| HTTP | `errorStatus` derivado | `retryable` | Mensagem fallback |
|------|------------------------|-------------|-------------------|
| 400  | `"rejected"` (ou body) | false       | "Sua mensagem foi rejeitada." |
| 403  | `"blocked"`            | false       | "Origem não autorizada." |
| 408  | body                   | true        | "O serviço demorou para responder. Tente novamente." |
| 429  | `"rejected"`           | true        | "Muitas tentativas em pouco tempo. Aguarde e tente novamente." |
| 5xx  | `"failed"` (ou body)   | true        | "Falha temporária no serviço. Tente novamente." |

## Cache de resposta (em memória)

- **Quando**: apenas para texto puro com resposta `2xx` cujo header `Cache-Control` traz `max-age=<n>` e `cache.cacheable === true`.
- **Quando NÃO**: áudio na requisição; `Cache-Control: no-store`; `cache.cacheable === false`; respostas de erro.
- **Chave**: `djb2(text)` (string trimada).
- **TTL**: `max-age * 1000` (limitado a 30 minutos por sanidade).
- **Persistência**: `Map` em memória; **proibido** localStorage/sessionStorage/IndexedDB.
- **Limpeza**: `clear()` chamado pelo hook em logout/troca de sessão (extensão futura) e em `unload`.

## Áudio de resposta

- Hook decodifica `result.audio.base64` via `audioFromBase64` quando presente.
- Resultado: `Blob` com `type = result.audio.mimeType`.
- Hook expõe `audioReplyBlob: Blob | null` e `audioReplyUrl: string | null` (criado via `URL.createObjectURL`, revogado ao substituir/desmontar).
- Sem persistência.

## Transições de estado (visão de uso pelo hook)

```
[idle]
  ├── sendText() ──► [loading] ──► success ──► [idle] (reply renderizado, audioReplyBlob exposto se houver)
  │                              └── failure ──► [idle] (toast; retry se retryable)
  └── sendAudio() ──► [optimize] ──► [loading] ──► success ──► [idle]
                                  └── failure ──► [idle]
```

Sem mudanças de máquina de estado em relação à feature 007.
