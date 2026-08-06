# Quickstart — Validar o Chat Gateway contra o BFF local

**Feature**: 008-align-chat-bff-contract
**Date**: 2026-04-30

Guia para validar manualmente o alinhamento do `chatGateway` com o BFF multimodal local.

## Pré-requisitos

- BFF Interasis AI rodando em `http://localhost:3001`.
- Documentação interativa disponível em `http://localhost:3001/api/docs`.
- Frontend rodando em `http://localhost:3000`.

## 1. Configurar variável de ambiente

`.env.local` na raiz do frontend:

```env
NEXT_PUBLIC_CHAT_BFF_ENDPOINT=http://localhost:3001/chat/message
```

## 2. Subir o frontend

```bash
npm run dev
```

## 3. Verificar envio de texto (US1)

1. Digitar `"Olá, pode me ajudar a contratar uma proposta?"` e enviar.
2. **Network**:
   - `POST http://localhost:3001/chat/message`
   - `Content-Type: application/json`
   - `Origin: http://localhost:3000`
   - Body: `{"text":"Olá, pode me ajudar a contratar uma proposta?"}` — **sem `kind`, sem `internalSecret`**
   - Cookies enviados (credenciais)
3. Resposta 2xx; resposta da assistente exibida.

## 4. Verificar envio de áudio (US2)

1. Gravar voz curta e enviar.
2. **Network**:
   - `POST http://localhost:3001/chat/message`
   - **Sem** `Content-Type` manual
   - Body multipart com part `audio` (filename `recording.webm`/`recording.mp4`/`recording.wav`)
   - **Sem** parts `kind`, `originalDurationMs`, `optimizedDurationMs`
3. Resposta 2xx; resposta exibida; se houver áudio na resposta, deve ser reproduzível (US5).

## 5. Verificar áudio com texto opcional (US2 cenário 2)

> Suporte apenas no gateway. Validar no console:

```js
import { sendAudioMessageToBff } from "/src/services/index.ts";
const blob = new Blob([new Uint8Array([0,1,2,3])], { type: "audio/webm" });
await sendAudioMessageToBff({ audio: blob, text: "Teste com texto adicional" });
```

`FormData` deve conter `audio` e `text`.

## 6. Verificar limites e validações locais

| Cenário | Esperado |
|---------|----------|
| Texto apenas com espaços | sem fetch; `"Mensagem de texto vazia."` |
| Texto > 4000 chars | sem fetch; mensagem de limite excedido (`status: 413`) |
| Áudio com `size: 0` | sem fetch; `"Áudio inválido para envio."` |
| Áudio > 10 MB | sem fetch; mensagem de limite excedido (`status: 413`) |

Snippet para validar 4000 chars:

```js
const big = "a".repeat(4001);
await sendTextMessageToBff({ text: big }); // deve retornar { ok:false, status:413 }
```

## 7. Verificar resposta canonical-first (US3)

1. Forçar BFF (ou mock) a responder com:

```json
{
  "input_text": "Oi",
  "response_text": "Olá, como posso ajudar?",
  "response_audio_base64": "UklGRiQAAABXQVZF...",
  "status": "completed",
  "responseId": "rsp_123",
  "sessionId": "ses_abc",
  "text": "LEGADO — não deve aparecer",
  "audio": { "mimeType": "audio/mpeg", "contentBase64": "QkFTRTY0LURJRkVSRU5URQ==" },
  "cache": { "cacheable": true, "source": "engine" },
  "correlationId": "req_01HZ..."
}
```

2. UI exibe `"Olá, como posso ajudar?"` (canonical, **não** legado).
3. Áudio decodificado vem do `response_audio_base64` (não do `audio.contentBase64`).
4. Console: log `[ChatGateway]` com `correlationId: "req_01HZ..."`, `responseId: "rsp_123"`, `sessionId: "ses_abc"`, `cacheable: true`.

## 8. Verificar áudio de resposta da assistente (US5)

1. Resposta com `response_audio_base64` válido.
2. Hook expõe `audioReplyBlob` (instância de `Blob`) e `audioReplyUrl` (string `blob:...`).
3. Reproduzir via `<audio src={audioReplyUrl} controls />` (manualmente no DevTools, se a UI ainda não expõe).

## 9. Verificar mapa de erros (FR-018)

Forçar BFF a responder cada cenário:

| HTTP | Body | Esperado |
|------|------|----------|
| 400 | `{ "status": "rejected", "reason": "Texto inválido" }` | `retryable: false`; mensagem `"Texto inválido"` |
| 403 | `{ "status": "blocked", "reason": "Origin is not allowed." }` | `retryable: false`; mensagem `"Origin is not allowed."` |
| 429 | `{ "status": "rejected", "reason": "Rate limit exceeded." }` | `retryable: true`; mensagem `"Rate limit exceeded."` |
| 502 | `{ "status": "failed", "reason": "AI Engine timeout" }` | `retryable: true`; mensagem `"AI Engine timeout"` |
| Sem rede | `fetch` rejeita | `status: 0`, `retryable: true` |

## 10. Verificar cache em memória de sessão (FR-020/FR-021)

1. Resposta com header `Cache-Control: max-age=60` e body `cache.cacheable: true`.
2. Repetir o mesmo texto dentro de 60 s → segunda chamada **não** deve disparar `fetch`; resposta vem do cache em memória.
3. Resposta com `Cache-Control: no-store` → segunda chamada repete `fetch`.
4. Recarregar a página (F5) → cache zerado (sem persistência em disco/localStorage).
5. Inspecionar `localStorage`/`sessionStorage` no DevTools: **nenhuma entrada** relacionada a respostas do chat.

## 11. Rodar a suíte de testes

```bash
npm test
```

Cobertura mínima:

- Endpoint `/chat/message`.
- Body JSON sem `kind`/`internalSecret`.
- Limite de 4000 chars (texto) e 10 MB (áudio) bloqueando antes do fetch.
- `FormData` com `audio` (+ `text` quando presente).
- Canonical-first em sucesso (texto e áudio).
- Mapa de erros 400/403/429/502.
- Cache em memória honra `Cache-Control` e `cache.cacheable`.
- `audioFromBase64` decodifica corretamente.

## Critérios de saída

- Nenhuma requisição em `/chat/messages` (plural).
- Nenhum payload de upload em Base64.
- Tamanho de payload de áudio ≤ 10 MB; texto ≤ 4000 chars.
- Logs com `correlationId` em todos os eventos.
- Nenhuma entrada de cache em `localStorage`/`sessionStorage`.
