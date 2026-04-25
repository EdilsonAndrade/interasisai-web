# Data Model: Otimização de Payload de Áudio e Integração BFF (EDI-25)

**Feature**: 007-optimize-audio-payload  
**Date**: 2026-04-25

---

## Entidades de domínio funcional

### 1. Mensagem de Voz Capturada

Representa o áudio bruto após gravação e antes da otimização.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | `string` | Identificador único da captura |
| `blob` | `Blob` | Deve existir e ter `size > 0` |
| `mimeType` | `string` | Ex.: `audio/webm` ou `audio/mp4` |
| `durationMs` | `number` | Deve ser maior que 0 |
| `createdAt` | `number` | Epoch ms da captura |

### 2. Mensagem de Voz Otimizada

Representa o resultado do processo de time-stretch pronto para integração.

| Campo | Tipo | Regra |
|---|---|---|
| `sourceCaptureId` | `string` | Referência à captura original |
| `blob` | `Blob` | Deve existir e ter `size > 0` |
| `mimeType` | `string` | Compatível com BFF |
| `originalDurationMs` | `number` | Copiado da captura |
| `optimizedDurationMs` | `number` | Deve ser `< originalDurationMs` |
| `optimizationFactor` | `number` | Faixa segura para inteligibilidade (definida em implementação) |

### 3. Payload de Integração

Abstração de envio para o canal único do BFF.

| Campo | Tipo | Regra |
|---|---|---|
| `kind` | `"audio" | "text"` | Derivado da origem da mensagem |
| `credentialsMode` | `RequestCredentials` | Deve usar credenciais de origem |
| `requestId` | `string` | Identificador para rastreio |
| `content` | `FormData | { text: string }` | Condicional por tipo |

### 4. Resultado de Envio

Representa o desfecho consumido pelo fluxo do chat.

| Campo | Tipo | Regra |
|---|---|---|
| `ok` | `boolean` | `true` em sucesso, `false` em falha |
| `status` | `number` | Código HTTP quando disponível |
| `message` | `string` | Mensagem legível para usuário/log |
| `retryable` | `boolean` | Indica se UI oferece nova tentativa |

---

## Relações

1. Uma `Mensagem de Voz Capturada` pode gerar zero ou uma `Mensagem de Voz Otimizada`.
2. `Payload de Integração` referencia conteúdo de texto ou a mensagem de voz otimizada.
3. Cada `Payload de Integração` gera exatamente um `Resultado de Envio`.

---

## Máquina de estados (alto nível)

```text
idle
  -> recording
  -> captured
  -> optimizing
  -> optimized
  -> sending
  -> success

Falhas:
optimizing -> optimize_error -> idle
sending -> send_error -> idle (com retry)
```

---

## Regras de validação derivadas dos requisitos

1. Não enviar áudio se `blob.size === 0`.
2. Não enviar áudio se `optimizedDurationMs >= originalDurationMs`.
3. Não enviar texto se `text.trim()` vazio.
4. Toda requisição deve incluir credenciais (`credentials: include` equivalente).
5. Em falha de otimização/envio, a UI deve exibir mensagem clara e manter chat estável.
