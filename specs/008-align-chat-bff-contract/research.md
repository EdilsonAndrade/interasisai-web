# Phase 0 Research — Alinhamento do Chat Gateway com o Contrato Multimodal do BFF

**Feature**: 008-align-chat-bff-contract
**Date**: 2026-04-30

## Decisões

### D1. Caminho default do endpoint multimodal

- **Decisão**: `/chat/message` (singular, relativo) como default no código; `NEXT_PUBLIC_CHAT_BFF_ENDPOINT` permanece como override.
- **Rationale**: alinha ao contrato (`POST /chat/message`), preserva DX local, permite override em produção/staging. O default atual `/chat/messages` (plural) gera 404.
- **Alternativas**: URL absoluta `http://localhost:3001/chat/message` (rejeitada — vaza ambiente em build); sem default (rejeitada — quebra DX em desenvolvimento).

### D2. Estrutura do payload de texto

- **Decisão**: `application/json`, body `{ "text": <trim, ≤ 4000> }`.
- **Rationale**: contrato canonical do BFF (feature 002 do backend). Campos extras (`kind`, `internalSecret`) violam FR-003/FR-023. Limite de 4000 caracteres é validação documentada do BFF (HTTP 400 quando excedido).
- **Alternativas**: manter `kind` por simetria — rejeitada (fora do contrato).

### D3. Estrutura do payload de áudio

- **Decisão**: `multipart/form-data`, part `audio` obrigatória (Blob binário), part `text` opcional. Sem `kind`, sem `originalDurationMs`/`optimizedDurationMs`. Sem `Content-Type` manual.
- **Rationale**: o backend usa `FileInterceptor` no campo `audio`. Métricas de duração não constam no contrato. `Content-Type` manual quebra a geração automática do `boundary` pelo `fetch`.
- **Alternativas**: enviar Base64 dentro de JSON — rejeitada explicitamente pelo guia.

### D4. Filename no multipart e MIME

- **Decisão**: derivar pelo `Blob.type`:
  - `audio/webm*` → `recording.webm`
  - `audio/mp4*` → `recording.mp4`
  - `audio/wav*` → `recording.wav`
  - fallback → `recording.bin`
- **Rationale**: backend roteia por nome de campo, não por extensão; manter coerência com MIME ajuda diagnóstico.

### D5. Limites locais

- **Decisão**:
  - Texto vazio → `status: 400`, `retryable: false`, mensagem `"Mensagem de texto vazia."`.
  - Texto > 4000 → `status: 413`, `retryable: false`, mensagem `"A mensagem excede o limite máximo de 4000 caracteres."`.
  - Áudio vazio → `status: 400`, `retryable: false`, mensagem `"Áudio inválido para envio."`.
  - Áudio > 10 MB → `status: 413`, `retryable: false`, mensagem `"O áudio excede o tamanho máximo permitido (10 MB)."`.
- **Rationale**: bloqueia rede antes de gastar banda e atende SC-004/SC-009. Status 413 é convenção HTTP para "Payload Too Large" e mantém semântica clara.
- **Alternativas**: usar 400 para tudo — rejeitada (perde diferenciação semântica útil em logs).

### D6. Normalização de resposta canonical-first

- **Decisão**: ler na ordem `response_text` → `text` → fallback. Para áudio: `response_audio_base64` → `audio.contentBase64`; `mimeType` vem do bloco `audio.mimeType` (default `"audio/mpeg"` quando ausente, conforme exemplo do guia).
- **Rationale**: FR-016/SC-008. A coexistência de campos novos e legados está documentada como retrocompatibilidade.
- **Alternativas**: ler somente legado — rejeitada (perde campos canonical); ler somente canonical — rejeitada (quebra retrocompatibilidade).

### D7. Mapa de erros HTTP do BFF

- **Decisão**:

| HTTP | Body `status` | `retryable` | Mensagem padrão (fallback) |
|------|---------------|-------------|----------------------------|
| 400  | `rejected`    | false       | "Sua mensagem foi rejeitada." |
| 403  | `blocked`     | false       | "Origem não autorizada." |
| 429  | `rejected`    | true        | "Muitas tentativas em pouco tempo. Aguarde e tente novamente." |
| 502  | `failed`      | true        | "Falha temporária no serviço de IA. Tente novamente." |
| 0/timeout | n/a       | true        | "Não foi possível se conectar ao serviço de mensagens." |

- Quando `reason` está presente no body, usar `reason` (precedência sobre `error`/`message`).
- **Rationale**: FR-018/SC-012. 429 e 502 são transitórios; 400/403 exigem ação do usuário/operador.
- **Alternativas**: tratar 502 como não recuperável — rejeitada (perde oportunidade de retry).

### D8. Áudio de resposta da assistente

- **Decisão**: gateway expõe `audio?: { base64: string; mimeType: string }` em `ChatGatewaySuccess`. Hook decodifica via `audioFromBase64` para `Blob`, criando `URL.createObjectURL` revogado em cleanup. Default `mimeType = "audio/mpeg"` quando ausente.
- **Rationale**: FR-022. Decodificação tardia (no hook, não no gateway) evita criar `Blob`/URL desnecessários quando o consumidor não precisar reproduzir.
- **Alternativas**: gateway já entregar `Blob` — rejeitada (acopla lifecycle de URL ao módulo de serviço; mais difícil de testar e reaproveitar).

### D9. Cache em memória de sessão

- **Decisão**: módulo `chatResponseCache` (Map) com TTL derivado de `Cache-Control: max-age=<n>` da resposta. Quando header é `no-store` ou bloco `cache.cacheable === false`, não persiste. Sem `localStorage`/`sessionStorage`/IndexedDB (FR-020/SC-011).
- **Chave**: hash simples (DJB2) sobre `text` (texto puro) ou `text + audio.size + audio.type` (áudio); para áudio, sem cache porque conteúdo binário muda.
- **Decisão complementar**: cache **só ativa para texto puro**. Áudio sempre faz round-trip.
- **Rationale**: respostas de áudio podem variar com pequenas diferenças no blob; cache textual cobre o caso comum (perguntas idênticas).
- **Alternativas**: cachear áudio também — rejeitada (chave instável).

### D10. Observabilidade — `correlationId`

- **Decisão**: hook chama `console.info("[ChatGateway]", { correlationId, responseId, sessionId, status, cacheable })` em sucesso e `console.error("[ChatGateway:error]", { correlationId?, status, reason })` em falha.
- **Rationale**: FR-019/SC-010. Mantém os logs estruturados, facilita futuras integrações com APM sem mudar a interface.
- **Alternativas**: emitir CustomEvent — rejeitada (overengineering nesta feature).

### D11. Segurança e CSP

- **Decisão**: nunca incluir `internalSecret` em qualquer requisição (FR-023). `URL.createObjectURL` continua autorizado pela CSP atual (`blob:` em `media-src`). Caso a CSP atual não permita `blob:` em `media-src`, ajustar em `next.config.ts` durante a Fase G.
- **Rationale**: cumpre Princípio VIII e SC-011.

## Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| CSP atual bloquear `blob:` em `media-src` | Verificar `next.config.ts` na Fase G; ajustar se necessário |
| Backend remover campos legados | Canonical-first já pronto; basta remover branches de fallback no futuro |
| `Cache-Control: max-age=0` mal interpretado | Tratar `max-age=0` ou `no-store` como não cacheável |
| Throttling 429 sem `Retry-After` | UI mostra mensagem genérica; manutenção futura pode honrar `Retry-After` se backend passar a enviá-lo |
| `correlationId` ausente | Logar evento mesmo sem o ID, marcando-o como `unknown` |

## Conclusão

Sem `NEEDS CLARIFICATION` em aberto. Pronto para a Fase 1.
