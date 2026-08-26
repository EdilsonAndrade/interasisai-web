# API Contracts: Follow-up Admin Panel

**Date**: 2026-08-26 | **Frontend Integration**: React/Next.js | **Backend**: EDI-53

---

## 1. Get Conversation History

**Endpoint**: `GET /tenants/{tenant_id}/conversation-history/{base_thread_id}`

**Path Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `tenant_id` | string | ID do tenant (e.g., "acme") |
| `base_thread_id` | string | ID da thread base (e.g., "acme:123") |

**Query Parameters**:

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `limit` | int | 200 | 500 | Número de mensagens a retornar |
| `before` | datetime | - | - | (Optional) Datetime para paginação reversa |

**Response (200 OK)**:

```json
{
  "tenant_id": "acme",
  "base_thread_id": "acme:123",
  "messages": [
    {
      "role": "human",
      "content": "Olá, gostaria de saber mais sobre a solução",
      "created_at": "2026-08-20T14:30:00Z"
    },
    {
      "role": "ai",
      "content": "Olá! Claro, ficarei feliz em explicar. Nossa solução oferece...",
      "created_at": "2026-08-20T14:31:00Z"
    }
  ]
}
```

**Notes**:
- `role` é `"human"` (cliente) ou `"ai"` (atendente)
- Mensagens em ordem cronológica ascendente
- Sem paginação manual; usar `limit` e `before` para controlar volume

---

## 2. Get Follow-up Queue

**Endpoint**: `GET /tenants/{tenant_id}/follow-up-queue`

**Path Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `tenant_id` | string | ID do tenant |

**Query Parameters**:

| Param | Type | Optional | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | Filter: `pendente`, `aprovado`, `enviado`, `descartado`, `opt_out` |

**Response (200 OK)**:

```json
{
  "tenant_id": "acme",
  "entries": [
    {
      "id": 1,
      "base_thread_id": "acme:123",
      "outcome": "sem_resposta",
      "summary": "Cliente perguntou sobre X e sumiu.",
      "draft_message": "Oi! Vi que você tinha interesse em...",
      "status": "pendente",
      "created_at": "2026-08-26T20:00:00Z"
    }
  ]
}
```

**Response (422 Unprocessable Entity)**:

```json
{
  "detail": "Invalid status: xyz"
}
```

---

## 3. Update Follow-up Queue Entry

**Endpoint**: `PATCH /tenants/{tenant_id}/follow-up-queue/{entry_id}`

**Path Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `tenant_id` | string | ID do tenant |
| `entry_id` | int | ID da entrada (e.g., 1) |

**Request Body** (todos opcionais, mas pelo menos 1 obrigatório):

```json
{
  "status": "aprovado",
  "draft_message": "Oi! Vi que você tinha interesse...",
  "approved_by": "admin@acme.com"
}
```

**Response (200 OK)** — retorna o registro atualizado:

```json
{
  "id": 1,
  "base_thread_id": "acme:123",
  "outcome": "sem_resposta",
  "summary": "...",
  "draft_message": "Oi! Vi que você tinha interesse...",
  "status": "aprovado",
  "created_at": "2026-08-26T20:00:00Z"
}
```

**Erros**:
- `404`: entry_id não existe ou pertence a outro tenant
- `422`: status inválido ou nenhum campo enviado

---

## 4. Get Tenant

**Endpoint**: `GET /tenants/{tenant_id}`

**Response (200 OK)**:

```json
{
  "id": "acme",
  "name": "ACME Inc",
  "google_calendar_id": "...",
  "allowed_domains": [...],
  "oferta_vigente_texto": "Desconto de 10% + frete grátis",
  "oferta_vigente_validade": "2026-12-31T23:59:59Z",
  "retention_days": 90,
  ...
}
```

**Nota**: Retorna objeto **completo** do tenant (não parcial)

---

## 5. Update Tenant

**Endpoint**: `PUT /tenants/{tenant_id}` ⚠️ **É `PUT`, não `PATCH`**

**Request Body** — objeto **completo** (inclui `name`, `google_calendar_id`, `allowed_domains`, etc):

```json
{
  "name": "ACME Inc",
  "google_calendar_id": "...",
  "allowed_domains": [...],
  "oferta_vigente_texto": "Desconto de 15% + frete grátis",
  "oferta_vigente_validade": "2027-01-31T23:59:59Z",
  "retention_days": 120,
  ...
}
```

**Response (200 OK)** — objeto completo atualizado

**Nota**: Frontend deve buscar tenant completo primeiro, então reenviar tudo

---

## 6. List/Search Tenants

**Endpoints**:
- `GET /tenants?q=` 
- `GET /tenants/list?q=&limit=&offset=`

**Query Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Query string para buscar (e.g., "acme") |
| `limit` | int | Opcional, default depende do backend |
| `offset` | int | Opcional, para paginação |

**Response**: Array de tenants ou listagem paginada

---

## Error Handling

**401 Unauthorized**:
```json
{ "detail": "Authentication required" }
```

**403 Forbidden**:
```json
{ "detail": "Only admin users can access this resource" }
```

**404 Not Found**:
```json
{ "detail": "Tenant/Entry not found" }
```

**422 Unprocessable Entity**:
```json
{ "detail": "Invalid parameter: xyz" }
```

**500 Internal Server Error**:
```json
{ "detail": "Internal server error" }
```

---

## Retry Strategy

- Timeout: 10 segundos
- Exponential backoff: 1s, 2s, 4s (3 tentativas max)
- Retry-able: 408, 429, 500, 502, 503, 504
- Non-retry-able: 400, 401, 403, 404, 422
