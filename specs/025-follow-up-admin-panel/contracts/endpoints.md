# API Contracts: Follow-up Admin Panel

**Date**: 2026-08-26 | **Frontend Integration**: React/Next.js

---

## 1. List Follow-up Queue

**Endpoint**: `GET /follow-up-queue`

**Query Parameters**:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | string | No | - | Filter por status: `pendente`, `aprovado`, `descartado`, `enviado`, `opt_out` |
| `outcome` | string | No | - | Filter por outcome: `fechado`, `pensando`, `sem_resposta`, `recusado`, `em_andamento` |
| `tenant_id` | string | No | - | Filter por tenant |
| `page` | number | No | 1 | Página (1-indexed) |
| `limit` | number | No | 20 | Itens por página (max 100) |

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "queue-123",
      "tenantId": "tenant-456",
      "baseThreadId": "thread-789",
      "outcome": "pensando",
      "summary": "Cliente mostrou interesse em solução mas solicitou mais informações sobre implementação",
      "draftMessage": "Olá João, obrigado pelo interesse! Seguem mais detalhes sobre...",
      "status": "pendente",
      "attempts": 0,
      "createdAt": "2026-08-26T10:15:00Z",
      "approvedBy": null,
      "approvedAt": null
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

**Response (400 Bad Request)**:

```json
{
  "code": "INVALID_FILTER",
  "message": "Status inválido: xyz",
  "details": { "validStatuses": ["pendente", "aprovado", "descartado", "enviado", "opt_out"] }
}
```

---

## 2. Update Follow-up Status

**Endpoint**: `PATCH /follow-up-queue/:queueId`

**Path Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `queueId` | string | Yes | ID do rascunho na fila |

**Request Body**:

```json
{
  "status": "aprovado",
  "draftMessage": "Olá João, obrigado pelo interesse! Seguem mais detalhes sobre a solução...",
  "approvedBy": "user-123"
}
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "queue-123",
    "tenantId": "tenant-456",
    "baseThreadId": "thread-789",
    "outcome": "pensando",
    "summary": "...",
    "draftMessage": "Olá João, obrigado pelo interesse! Seguem mais detalhes sobre...",
    "status": "aprovado",
    "attempts": 0,
    "createdAt": "2026-08-26T10:15:00Z",
    "approvedBy": "user-123",
    "approvedAt": "2026-08-26T10:35:00Z"
  },
  "success": true
}
```

**Response (404 Not Found)**:

```json
{
  "code": "QUEUE_NOT_FOUND",
  "message": "Follow-up queue entry not found",
  "details": { "queueId": "queue-123" }
}
```

---

## 3. Get Conversation History

**Endpoint**: `GET /conversation-history/:tenantId/:baseThreadId`

**Path Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tenantId` | string | Yes | ID do tenant |
| `baseThreadId` | string | Yes | ID da thread base |

**Query Parameters**:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | number | No | 1 | Página (1-indexed) |
| `limit` | number | No | 50 | Mensagens por página (max 200) |

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "msg-001",
      "tenantId": "tenant-456",
      "baseThreadId": "thread-789",
      "activeThreadId": "active-999",
      "role": "user",
      "content": "Olá, gostaria de saber mais sobre a solução",
      "createdAt": "2026-08-20T14:30:00Z"
    },
    {
      "id": "msg-002",
      "tenantId": "tenant-456",
      "baseThreadId": "thread-789",
      "activeThreadId": "active-999",
      "role": "assistant",
      "content": "Olá! Claro, ficarei feliz em explicar. Nossa solução oferece...",
      "createdAt": "2026-08-20T14:31:00Z"
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 50,
  "hasMore": false
}
```

**Response (404 Not Found)**:

```json
{
  "code": "HISTORY_NOT_FOUND",
  "message": "Conversation history not found",
  "details": { "tenantId": "tenant-456", "baseThreadId": "thread-789" }
}
```

---

## 4. Get Tenant Configuration

**Endpoint**: `GET /tenants/:tenantId`

**Path Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tenantId` | string | Yes | ID do tenant |

**Response (200 OK)**:

```json
{
  "data": {
    "id": "tenant-config-123",
    "tenantId": "tenant-456",
    "ofertaVigente": {
      "text": "Desconto de 10% + frete grátis até 31/12/2026",
      "validUntil": "2026-12-31T23:59:59Z"
    },
    "retentionDays": 90,
    "updatedAt": "2026-08-20T10:00:00Z"
  }
}
```

**Response (404 Not Found)**:

```json
{
  "code": "TENANT_NOT_FOUND",
  "message": "Tenant not found",
  "details": { "tenantId": "tenant-456" }
}
```

---

## 5. Update Tenant Configuration

**Endpoint**: `PATCH /tenants/:tenantId`

**Path Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `tenantId` | string | Yes | ID do tenant |

**Request Body**:

```json
{
  "ofertaVigente": {
    "text": "Desconto de 15% + frete grátis até 31/01/2027",
    "validUntil": "2027-01-31T23:59:59Z"
  },
  "retentionDays": 120
}
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "tenant-config-123",
    "tenantId": "tenant-456",
    "ofertaVigente": {
      "text": "Desconto de 15% + frete grátis até 31/01/2027",
      "validUntil": "2027-01-31T23:59:59Z"
    },
    "retentionDays": 120,
    "updatedAt": "2026-08-26T11:00:00Z"
  },
  "success": true
}
```

**Response (400 Bad Request)**:

```json
{
  "code": "INVALID_CONFIG",
  "message": "Retention days must be greater than 0",
  "details": { "retentionDays": -5 }
}
```

---

## Error Handling

Todas as endpoints podem retornar:

**401 Unauthorized**:
```json
{
  "code": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

**403 Forbidden** (não é admin):
```json
{
  "code": "FORBIDDEN",
  "message": "Only admin users can access this resource"
}
```

**500 Internal Server Error**:
```json
{
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "details": { "requestId": "req-12345" }
}
```

---

## Rate Limiting

- Limite: 100 requisições por minuto por user
- Header resposta: `X-RateLimit-Remaining: 45`
- Excesso: HTTP 429 "Too Many Requests"

---

## Timeout & Retry

- Timeout padrão: 10 segundos
- Frontend deve implementar retry com exponential backoff (3 tentativas max)
- Status retry-able: 408, 429, 500, 502, 503, 504
