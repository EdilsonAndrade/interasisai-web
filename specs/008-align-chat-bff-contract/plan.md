# Implementation Plan: Alinhamento do Chat Gateway com o Contrato Multimodal do BFF

**Branch**: `008-align-chat-bff-contract` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-align-chat-bff-contract/spec.md`

## Summary

Alinhar o `chatGateway` do frontend ao contrato multimodal único do BFF (`POST /chat/message`):

- **Envio de texto** via `application/json` com corpo `{ "text": <≤ 4000 chars> }`, sem campos extras (sem `kind`, sem `internalSecret`).
- **Envio de áudio** via `multipart/form-data` com campo binário `audio` e `text` opcional; sem Base64; sem campos de duração.
- **Validações locais**: texto vazio (`status: 400`), texto > 4000 chars (`status: 413`), áudio vazio (`status: 400`), áudio > 10 MB (`status: 413`); falham antes de qualquer chamada de rede.
- **Normalização de resposta canonical-first**: preferir `response_text` / `response_audio_base64`; usar `text` / `audio.contentBase64` como fallback (FR-016). Expor `responseId`, `sessionId`, `correlationId`, `status` (`completed`), `cache.cacheable`/`cache.source` ao consumidor.
- **Áudio de resposta** (FR-022): decodificar Base64 em memória de sessão e expor um `Blob` reproduzível ao hook (sem persistir em disco).
- **Mapeamento de erros** (FR-018): 400 `rejected` (não recuperável), 403 `blocked` (não recuperável), 429 `rejected` por throttling (recuperável), 502 `failed` upstream (recuperável); extrair `reason`.
- **Cache em memória de sessão** (FR-020/FR-021): respeitar `Cache-Control` (decisivo) + bloco `cache` (complementar); nunca persistir em disco.
- **Observabilidade** (FR-019): logar `correlationId`/`responseId`/`sessionId` em cada evento de UI relacionado.
- **`credentials: "include"`** preservado (FR-007).

A mudança fica concentrada no serviço (`chatGateway`), nos tipos, em uma pequena store de cache de sessão e em ajustes pontuais no hook do chat para expor o áudio reproduzível e logar IDs. Sem alterações visuais (US2 cenário "texto + áudio" exposto apenas no gateway, FR-005).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.4, Next.js 16.2.4 (App Router)
**Primary Dependencies**: APIs nativas do browser (`fetch`, `FormData`, `Blob`, `atob`, `URL.createObjectURL`); sem novas dependências runtime
**Storage**: cache em memória de sessão (módulo singleton); **proibido** `localStorage`/`sessionStorage`/IndexedDB para respostas (FR-020/SC-011)
**Testing**: Jest 30 + React Testing Library; mocks de `fetch`/`FormData`/`Blob`/`atob`
**Target Platform**: Frontend web (browsers modernos)
**Project Type**: Web application (Next.js App Router, single project)
**Performance Goals**: SC-006 (feedback de erro ≤ 1s); zero regressão de latência de envio
**Constraints**: contrato exato (`POST /chat/message`); `credentials: "include"`; sem `Content-Type` manual em multipart (FR-006); texto ≤ 4000 chars (FR-017); áudio ≤ 10 MB (FR-013); sem Base64 no upload; sem `internalSecret` (FR-023); sem persistência de resposta em disco (FR-020)
**Scale/Scope**: ajuste em [src/services/chatGateway.ts](../../src/services/chatGateway.ts), [src/services/chatGateway.types.ts](../../src/services/chatGateway.types.ts), [src/hooks/useChatAssistant.ts](../../src/hooks/useChatAssistant.ts) e respectivos testes; novo módulo de cache em memória (`src/services/chatResponseCache.ts`); novo helper de decodificação Base64 (`src/services/audioFromBase64.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Observação |
|-----------|--------|-----------|
| I. Hooks/UI | PASS | Toda lógica de contrato no `chatGateway`; cache e decodificação em módulos de serviço; hook orquestra |
| II. Context API | PASS | Sem novo provider global; `ChatContext` inalterado |
| III. DRY | PASS | Único módulo de gateway, único cache, helpers reutilizáveis |
| IV. Testes obrigatórios | PASS | Testes cobrem contrato canonical/legado, validações locais (texto vazio/>4000, áudio vazio/>10MB), erros 400/403/429/502, cache, decodificação Base64 |
| V. TypeScript/erros | PASS | Tipos discriminados; sem `any`; falhas explícitas via `ChatGatewayFailure` |
| VI. Visual | PASS | Sem mudanças de UI/Tailwind/Framer Motion |
| VII. A11y/SEO | PASS | Sem regressão; áudio de resposta exposto via `<audio>` em hook (acessível por padrão do navegador) |
| VIII. Segurança | PASS | `credentials: "include"`; sem `internalSecret`; cache só em memória; sem `dangerouslySetInnerHTML`; Base64 da resposta decodificada localmente sem render como HTML |

**Result**: gates aprovados para Fase 0.

## Project Structure

### Documentation (this feature)

```text
specs/008-align-chat-bff-contract/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── chat-multimodal-bff-verification.md
├── checklists/
│   └── requirements.md
└── tasks.md  # gerado por /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── chatGateway.ts               # ALINHAR contrato de envio/recepção
│   ├── chatGateway.types.ts         # ALINHAR tipos: payloads, success canonical, failure, cache
│   ├── chatGateway.test.ts          # ATUALIZAR cenários
│   ├── chatResponseCache.ts         # NOVO: cache em memória de sessão (Map)
│   ├── chatResponseCache.test.ts    # NOVO
│   ├── audioFromBase64.ts           # NOVO: helper de decodificação para Blob
│   ├── audioFromBase64.test.ts      # NOVO
│   └── index.ts                     # exportar novos helpers
├── hooks/
│   ├── useChatAssistant.ts          # ATUALIZAR: consumir reply canonical, expor audioReplyBlob, logar correlationId
│   └── useChatAssistant.test.ts     # ATUALIZAR cenários
└── app/                             # sem mudança
```

**Structure Decision**: manter o frontend Next.js (single project) e concentrar a mudança em três módulos de serviço (gateway + cache + decoder) e no hook. Default do endpoint passa a ser `/chat/message` (caminho relativo, singular), com override por `NEXT_PUBLIC_CHAT_BFF_ENDPOINT`.

## Phase 0: Research Output

Arquivo gerado: [research.md](./research.md).

Decisões consolidadas (resumo):

1. **Default do endpoint**: `/chat/message` (relativo, singular); env override.
2. **Texto JSON**: `{ "text": <trim, ≤ 4000> }` apenas; sem `kind`, sem `internalSecret`.
3. **Áudio multipart**: parts `audio` (Blob com filename derivado do MIME) e `text` opcional; sem `kind`, sem durações; sem `Content-Type` manual.
4. **Limites locais**: texto > 4000 → `status: 413` (FR-017); áudio > 10 MB → `status: 413` (FR-013); ambos não recuperáveis.
5. **Resposta canonical-first**: `response_text` → fallback `text`; `response_audio_base64` → fallback `audio.contentBase64` (com `audio.mimeType`).
6. **Áudio de resposta**: decodificação Base64 → `Blob` (default `audio/mpeg`); exposto pelo hook como `audioReplyBlob` + `audioReplyUrl` via `URL.createObjectURL` (revogado ao desmontar/substituir).
7. **Mapa de erros**: 400/403 → `retryable: false`; 429/502 → `retryable: true`; `reason` substitui `error/message` quando presente.
8. **Cache de sessão**: `Map<requestKey, { reply, audioBase64?, mimeType?, expiresAt }>` em memória; chave = hash(`text` + `audio.size + audio.type`); honra `Cache-Control` (`max-age` ou `no-store`) e `cache.cacheable`.
9. **`correlationId`**: anexado ao `console.info`/`console.error` de cada chamada e ao log do hook.
10. **Métricas de duração**: continuam apenas em `console.info` no hook, fora do payload.

## Phase 1: Design & Contracts Output

Arquivos gerados:

1. [data-model.md](./data-model.md) — entidades funcionais e regras de validação atualizadas (texto ≤ 4000, áudio ≤ 10 MB, resposta canonical-first, cache, áudio de resposta).
2. [quickstart.md](./quickstart.md) — passo a passo para validar contra `http://localhost:3001/chat/message` (texto, áudio, áudio + texto, limites, erros 400/403/429/502, cache, áudio de resposta).
3. [contracts/chat-multimodal-bff-verification.md](./contracts/chat-multimodal-bff-verification.md) — matriz de testes C1–C9.

## Implementation Phases (for /speckit.tasks)

### Fase A — Tipos e contrato

1. Atualizar `chatGateway.types.ts`:
   - `SendTextMessageInput`, `SendAudioMessageInput` (com `text?` opcional em áudio).
   - `BffSuccessPayload` com canonical (`response_text`, `response_audio_base64`, `input_text`) e legado (`text`, `audio.{mimeType,contentBase64}`), `responseId`, `sessionId`, `correlationId`, `status`, `cache.{cacheable,source}`.
   - `BffErrorPayload` com `status: "rejected" | "blocked" | "failed"` e `reason`.
   - `ChatGatewaySuccess` expõe `reply`, `audio?: { base64: string; mimeType: string }`, `responseId?`, `sessionId?`, `correlationId?`, `cache?: { cacheable: boolean; source: string; cacheControl?: string }`.
   - Constantes `MAX_TEXT_LENGTH = 4000`, `MAX_AUDIO_PAYLOAD_BYTES = 10 * 1024 * 1024`.

### Fase B — Gateway

1. Default endpoint `/chat/message`.
2. `sendTextMessageToBff`: trim; validar vazio (400) e tamanho > 4000 (413); body `{ text }`; sem `kind`.
3. `sendAudioMessageToBff`: validar `audio.size <= 0` (400) e > 10 MB (413); montar `FormData` com `audio` + filename derivado do MIME; `text` opcional após trim não vazio; sem `kind`/durações; sem `Content-Type` manual.
4. `normalizeBffResponse`:
   - Sucesso: ler `response_text` → fallback `text` → fallback `"Recebemos sua mensagem e já estamos processando."`. Áudio: `response_audio_base64` → fallback `audio.contentBase64`. `mimeType`: do bloco `audio.mimeType` quando presente, senão `"audio/mpeg"`.
   - Erro: ler `reason` → `error` → `message` → fallback. Mapear `retryable` por status (400/403 false; 408/429/5xx true; 0 true).
   - Anexar `responseId`, `sessionId`, `correlationId`, `cache` e `cacheControl` (do header) em `ChatGatewaySuccess`.
5. Em rede: capturar exceção → `status: 0`, `retryable: true`.

### Fase C — Cache em memória de sessão

1. Implementar `chatResponseCache.ts` com `Map` interno.
2. API: `get(key)`, `set(key, entry, ttlMs)`, `clear()`.
3. TTL derivado de `Cache-Control: max-age=<n>`; quando `no-store` → não persiste.
4. Chave gerada por helper `buildRequestKey(input)` (hash simples sobre `text` ou `audio.size + audio.type + textOpcional`).
5. Apenas o gateway usa o cache; expor utilitário ao hook somente para limpar em logout/troca de sessão.

### Fase D — Decodificação Base64

1. `audioFromBase64.ts` com `decodeAudioBase64(base64: string, mimeType: string): Blob`.
2. Cobre browser nativo via `atob` + `Uint8Array`.
3. Validação: rejeita string vazia ou inválida com erro tipado.

### Fase E — Hook do chat

1. Consumir `ChatGatewaySuccess.reply` e novo `audioReplyBlob` (decodificado quando `result.audio` presente).
2. Expor `audioReplyBlob: Blob | null` e `audioReplyUrl: string | null` (criado via `URL.createObjectURL` na atualização e revogado em cleanup).
3. Logar `console.info("[ChatGateway]", { correlationId, responseId, sessionId, status, cacheable })` em sucesso e `console.error` em falha.
4. Manter `console.info("[Audio Optimization]", ...)` (durações) já existente.
5. Não enviar `originalDurationMs`/`optimizedDurationMs` ao gateway.

### Fase F — Testes

`chatGateway.test.ts`:

- Endpoint default `/chat/message`; override via env e via `input.endpoint`.
- Texto: body `{"text":"..."}`, sem `kind`; trim aplicado; texto vazio bloqueia; > 4000 chars retorna 413 sem fetch.
- Áudio: FormData com `audio` (filename `.webm`/`.mp4`/`.wav`/`.bin`); `text` opcional anexado quando trim não vazio; sem `kind`/durações; áudio > 10 MB retorna 413 sem fetch.
- Resposta sucesso canonical: `response_text` tem precedência sobre `text`; idem para áudio.
- Resposta sucesso legado: usa `text`/`audio.contentBase64` quando canonical ausente.
- Resposta sucesso sem áudio: `result.audio` é `undefined`.
- Identificadores: `responseId`, `sessionId`, `correlationId`, `cache` propagados.
- Erros: 400/403 → `retryable: false`; 429/502 → `retryable: true`; `reason` extraído.
- Rede: `fetch` lança → status 0 retryable.

`chatResponseCache.test.ts`: `set`/`get`/expiração por TTL; `no-store` não persiste.

`audioFromBase64.test.ts`: decodifica base64 conhecido para `Blob` com `mimeType` correto; rejeita base64 inválido.

`useChatAssistant.test.ts`: sucesso com `audioReplyBlob` exposto; sucesso sem áudio; falha 400 não recuperável; falha 502 recuperável.

### Fase G — Configuração e documentação

1. Atualizar `.env.example` (ou criar) com `NEXT_PUBLIC_CHAT_BFF_ENDPOINT=http://localhost:3001/chat/message`.
2. Atualizar `quickstart.md` com cenários de validação manual contra o BFF local.

## Post-Design Constitution Re-Check

| Princípio | Verificação pós-design | Status |
|-----------|------------------------|--------|
| I. Hooks/UI | Lógica de contrato/cache/decodificação em serviços; hook orquestra; componentes seguem dumb | PASS |
| II. Context API | Inalterado | PASS |
| III. DRY | Helpers únicos para cache, decodificação e gateway | PASS |
| IV. Testes | Cobertura explícita por suíte (gateway, cache, decoder, hook) | PASS |
| V. TypeScript | Tipos discriminados; sem `any` | PASS |
| VI. Visual | Sem mudança | PASS |
| VII. A11y/SEO | Áudio de resposta exposto via `<audio controls>` (acessível) quando usado em UI futura; nesta feature, o blob é apenas exposto pelo hook | PASS |
| VIII. Segurança | Sem `internalSecret`; sem persistência em disco; Base64 decodificado localmente; nunca renderizado como HTML; `credentials: "include"`; CSP inalterada | PASS |

**Result**: ALL GATES PASS — pronto para `/speckit.tasks`.

## Complexity Tracking

Nenhuma violação da constituição identificada. Os dois módulos novos (`chatResponseCache`, `audioFromBase64`) são justificados:

- `chatResponseCache`: isolar regra de TTL/`Cache-Control` e garantir que NUNCA tocará disco (SC-011).
- `audioFromBase64`: helper testável separadamente; evita inflar o gateway com lógica de decodificação binária.
