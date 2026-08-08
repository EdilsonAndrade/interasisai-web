# Data Model: Conexão de Instâncias WhatsApp

## TenantReference

Referência a um tenant existente; esta feature não cria nem persiste tenants.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `tenantId` | string | yes | `trim()` deve resultar em texto não vazio |

**Relationships**: Um `TenantReference` pode possuir uma ou mais `WhatsAppInstance`, conforme regras do backend.

## WhatsAppInstance

Identidade da instância cadastrada no serviço oficial.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `tenantId` | string | yes on create | Deve corresponder ao tenant enviado e retornado pelo backend |
| `instanceName` | string | yes | `trim()` não vazio; codificado como segmento ao navegar/consultar |
| `message` | string | no | Confirmação textual devolvida na criação |

**Relationships**: Pertence a um `TenantReference`; pode possuir no máximo um `ConnectionQrCode` ativo no estado frontend.

## ConnectionQrCode

Imagem temporária para conexão da instância.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `instanceName` | string | yes | Deve corresponder à instância da solicitação ativa |
| `dataUrl` | string | yes | Deve iniciar com `data:image/png;base64,` e conter payload Base64 não vazio válido |
| `source` | `create` \| `reconnect` | yes | Origem da resposta aceita |

**Lifecycle**: Existe somente em memória no provider. É substituído após nova resposta válida da mesma instância e descartado ao desmontar a árvore administrativa ou encerrar sessão.

## ConnectionRequestState

União discriminada que representa uma única operação ativa.

| State | Required data | Allowed transitions |
|---|---|---|
| `idle` | none | `creating`, `loadingQr` |
| `creating` | request id, tenant, instance | `success`, `error`, substituída por nova operação |
| `loadingQr` | request id, instance | `success`, `error`, substituída por nova operação |
| `success` | operation, instance, QR | `creating`, `loadingQr`, `idle` |
| `error` | operation, message, retryable | `creating`, `loadingQr`, `idle` |

**Invariant**: Somente a resposta cujo request id ainda é o ativo pode transicionar o estado.

## AdminSession

Sessão administrativa assinada, sem dados de QR ou credenciais no payload.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `subject` | string | yes | Identificador fixo do administrador autenticado |
| `issuedAt` | integer | yes | Epoch seconds válido |
| `expiresAt` | integer | yes | Posterior a `issuedAt` e ao horário atual durante validação |
| `signature` | string | yes | HMAC-SHA256 válido por comparação resistente a timing |

**Lifecycle**: Criada no login, armazenada em cookie `httpOnly`, expira após o período configurado e é removida no logout.
