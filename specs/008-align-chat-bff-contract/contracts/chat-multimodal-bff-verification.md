# Contract Verification — Chat Multimodal BFF (`POST /chat/message`)

**Feature**: 008-align-chat-bff-contract
**Date**: 2026-04-30
**Cobre**: FR-001 a FR-023

> Verificação automatizada via Jest + RTL. Suítes em [src/services/chatGateway.test.ts](../../../src/services/chatGateway.test.ts), `src/services/chatResponseCache.test.ts`, `src/services/audioFromBase64.test.ts` e [src/hooks/useChatAssistant.test.ts](../../../src/hooks/useChatAssistant.test.ts).

## C1. Endpoint

| Cenário | Setup | Asserção |
|---------|-------|----------|
| Default sem env | env indefinido | `fetch` chamado com `/chat/message` |
| Override por env | `NEXT_PUBLIC_CHAT_BFF_ENDPOINT="https://api.example.com/chat/message"` | URL exata |
| Override pontual | `input.endpoint = "/custom"` | prevalece sobre env |

## C2. Envio de texto

| Cenário | Asserção |
|---------|----------|
| Texto válido | `POST`, `credentials: "include"`, `Content-Type: application/json`, body `{"text":"olá"}`. **Sem `kind`. Sem `internalSecret`.** |
| Trim | `text: "  oi  "` → body `{"text":"oi"}` |
| Texto vazio | sem `fetch`; `{ ok:false, status:400, retryable:false, errorStatus:"local" }` |
| Texto > 4000 chars (`"a".repeat(4001)`) | sem `fetch`; `{ ok:false, status:413, retryable:false, errorStatus:"local" }` |
| Texto = 4000 chars | `fetch` chamado normalmente |

## C3. Envio de áudio

| Cenário | Asserção |
|---------|----------|
| Áudio webm | `FormData` com `audio` filename `.webm`. **Sem `kind`/`originalDurationMs`/`optimizedDurationMs`. Sem `Content-Type` manual.** |
| Áudio mp4 | filename `.mp4` |
| Áudio wav | filename `.wav` |
| MIME desconhecido | filename `recording.bin` |
| `text` opcional não vazio | FormData contém `audio` e `text` |
| `text` opcional só com espaços | FormData **não** contém `text` |
| Áudio vazio (`size:0`) | sem `fetch`; `status:400, retryable:false` |
| Áudio > 10 MB | sem `fetch`; `status:413, retryable:false` |
| Áudio = 10 MB | `fetch` chamado |

## C4. Normalização de sucesso (canonical-first)

| Resposta | `result.reply` | `result.audio` |
|----------|---------------|----------------|
| `{ response_text: "A", text: "B" }` | `"A"` | `undefined` |
| `{ text: "B" }` (sem canonical) | `"B"` | `undefined` |
| `{}` | fallback `"Recebemos sua mensagem e já estamos processando."` | `undefined` |
| `{ response_audio_base64: "X", audio: { mimeType: "audio/wav", contentBase64: "Y" } }` | n/a | `{ base64: "X", mimeType: "audio/wav" }` |
| `{ audio: { contentBase64: "Y" } }` (sem mimeType) | n/a | `{ base64: "Y", mimeType: "audio/mpeg" }` |
| `{ response_audio_base64: "X" }` (sem bloco audio) | n/a | `{ base64: "X", mimeType: "audio/mpeg" }` |

Identificadores propagados: `responseId`, `sessionId`, `correlationId`, bloco `cache`, header `Cache-Control` em `result.cache.cacheControl`.

## C5. Normalização de erro

| HTTP | Body | `retryable` | `message` (precedência) |
|------|------|-------------|-------------------------|
| 400 | `{ status:"rejected", reason:"X" }` | false | `"X"` |
| 403 | `{ status:"blocked", reason:"Origin is not allowed." }` | false | `"Origin is not allowed."` |
| 429 | `{ status:"rejected", reason:"Rate limit exceeded." }` | true | `"Rate limit exceeded."` |
| 502 | `{ status:"failed", reason:"AI Engine timeout" }` | true | `"AI Engine timeout"` |
| 400 | `{ error:"E" }` (sem reason) | false | `"E"` |
| 400 | `{ message:"M" }` (sem reason/error) | false | `"M"` |
| 408 | qualquer | true | fallback |
| 503 | qualquer | true | fallback |
| Rede (fetch lança) | n/a | true | `status:0`, mensagem rede |

## C6. Credenciais e segurança

| Cenário | Asserção |
|---------|----------|
| Toda requisição (texto ou áudio) | `credentials: "include"` presente nas opções de `fetch` |
| Body JSON | **não** contém chave `internalSecret` |
| FormData | **não** contém entrada `internalSecret` |

## C7. Cache em memória de sessão

| Cenário | Asserção |
|---------|----------|
| Texto idêntico, resposta com `Cache-Control: max-age=60` e `cache.cacheable: true` | 2ª chamada **não** dispara `fetch` (servida pelo cache) |
| Texto idêntico, resposta `Cache-Control: no-store` | 2ª chamada dispara `fetch` |
| Texto idêntico, resposta `cache.cacheable: false` | 2ª chamada dispara `fetch` |
| TTL expirado (`max-age=0`) | 2ª chamada dispara `fetch` |
| Áudio | nunca cacheia (sempre dispara `fetch`) |
| Resposta de erro | nunca cacheia |
| Persistência | nenhuma entrada em `localStorage`/`sessionStorage` (assert via spies) |

## C8. Decodificação Base64

| Cenário | Asserção |
|---------|----------|
| Base64 válido + mimeType `audio/mpeg` | retorna `Blob` com `type: "audio/mpeg"` e bytes corretos |
| Base64 vazio | lança erro tipado |
| Base64 inválido | lança erro tipado |

## C9. Hook (`useChatAssistant`)

| Cenário | Asserção |
|---------|----------|
| Texto OK com canonical reply | mensagem da assistente renderizada com `response_text` |
| Resposta com áudio | `audioReplyBlob` exposto (instância de `Blob`); `audioReplyUrl` é string iniciando em `blob:` |
| Resposta sem áudio | `audioReplyBlob: null`, `audioReplyUrl: null` |
| Falha 400 | mensagem de erro exibida; `canRetry: false` |
| Falha 502 | mensagem de erro exibida; `canRetry: true` |
| `correlationId` | `console.info` chamado com `[ChatGateway]` contendo `correlationId` |
| Cleanup | `URL.revokeObjectURL` chamado quando `audioReplyBlob` é substituído ou hook desmontado |

## Critérios de aprovação

- 100% dos cenários acima cobertos por testes em verde antes do merge.
- Nenhum teste exercita `/chat/messages` (plural).
- Nenhum teste exercita `kind`/`internalSecret`/`originalDurationMs`/`optimizedDurationMs` no payload de rede.
- Nenhum teste persiste resposta em `localStorage`/`sessionStorage`/IndexedDB.
