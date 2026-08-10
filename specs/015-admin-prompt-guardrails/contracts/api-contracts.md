# API Contracts: Administração de Prompts e Guardrails

**Feature**: 015-admin-prompt-guardrails
**Date**: 2026-08-10

## Base URL

```
{baseUrl}/prompt-manager
```

Where `{baseUrl}` = `process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL` (ex: `http://localhost:8000`).

---

## 1. Guardrails

### 1.1 Listar Guardrails

```
GET /prompt-manager/guardrails
```

**Response 200**:
```json
[
  {
    "id": "uuid-string",
    "titulo": "Proibido falar sobre política",
    "conteudo": "# Regra de Segurança\n\nNunca discuta...",
    "is_global": true
  }
]
```

**Response 4xx/5xx**: `{ "detail": "mensagem de erro" }`

---

### 1.2 Criar Guardrail

```
POST /prompt-manager/guardrails
Content-Type: application/json
```

**Request Body**:
```json
{
  "titulo": "Proibido falar sobre política",
  "conteudo": "# Regra\n\nConteúdo markdown...",
  "is_global": false
}
```

**Response 201**:
```json
{
  "id": "uuid-string",
  "titulo": "Proibido falar sobre política",
  "conteudo": "# Regra\n\nConteúdo markdown...",
  "is_global": false
}
```

**Response 422 (Validation Error)**:
```json
{
  "detail": [
    {
      "loc": ["body", "titulo"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

### 1.3 Atualizar Guardrail

```
PUT /prompt-manager/guardrails/{id}
Content-Type: application/json
```

**Request Body**: same as create

**Response 200**: same as create response

**Response 404**: `{ "detail": "Guardrail not found" }`

---

### 1.4 Excluir Guardrail

```
DELETE /prompt-manager/guardrails/{id}
```

**Response 200**: `null` or `{ "ok": true }`

**Response 404**: `{ "detail": "Guardrail not found" }`

**Response 409**: `{ "detail": "Guardrail is linked to prompts" }`

---

## 2. Prompts

### 2.1 Listar Prompts

```
GET /prompt-manager/prompts
```

**Response 200**:
```json
[
  {
    "id": "uuid-string",
    "titulo": "Atendimento Inicial",
    "conteudo": "# Prompt\n\nVocê é um assistente...",
    "is_default": true,
    "guardrail_ids": ["uuid-1", "uuid-2"],
    "guardrails": [
      { "id": "uuid-1", "titulo": "...", "conteudo": "...", "is_global": true }
    ]
  }
]
```

---

### 2.2 Criar Prompt

```
POST /prompt-manager/prompts
Content-Type: application/json
```

**Request Body**:
```json
{
  "titulo": "Atendimento Inicial",
  "conteudo": "# Prompt\n\nVocê é um assistente...",
  "is_default": false,
  "guardrail_ids": ["uuid-1", "uuid-2"]
}
```

**Response 201**: same shape as single prompt from list

**Response 422**: validation error (same format as guardrail)

---

### 2.3 Atualizar Prompt

```
PUT /prompt-manager/prompts/{id}
Content-Type: application/json
```

**Request Body**: same as create

**Response 200**: same as create response

**Response 404**: `{ "detail": "Prompt not found" }`

---

### 2.4 Excluir Prompt

```
DELETE /prompt-manager/prompts/{id}
```

**Response 200**: `null` or `{ "ok": true }`

**Response 404**: `{ "detail": "Prompt not found" }`

---

## 3. Vínculo Tenant-Prompt

### 3.1 Vincular Tenant

```
POST /prompt-manager/link-tenant
Content-Type: application/json
```

**Request Body**:
```json
{
  "tenant_id": "tenant-uuid",
  "prompt_id": "prompt-uuid",
  "custom_content_override": "# Prompt Customizado\n\nPara tenant X..."
}
```

- `custom_content_override` é opcional

**Response 200/201**:
```json
{
  "tenant_id": "tenant-uuid",
  "prompt_id": "prompt-uuid",
  "custom_content_override": null
}
```

**Response 404**: `{ "detail": "Tenant or Prompt not found" }`

**Response 409**: `{ "detail": "Link already exists" }`

---

## Error Handling Strategy (Frontend)

| HTTP Status | User Message | Toast Type |
|-------------|-------------|------------|
| 200/201 | `"{Entity} {action} com sucesso"` | `toast.success` |
| 400 | `"Dados inválidos. Verifique os campos."` | `toast.error` |
| 404 | `"{Entity} não encontrado(a)."` | `toast.error` |
| 409 | `"Operação conflitante. O item pode estar vinculado."` | `toast.error` |
| 422 | Field-level errors mapped to form fields | Inline + `toast.error` |
| 500+ | `"Erro interno do servidor. Tente novamente."` | `toast.error` |
| Network Error | `"Não foi possível conectar ao servidor."` | `toast.error` |

**Note on PUT/DELETE endpoints**: If the backend returns 404 or 405 for update/delete endpoints not yet implemented, the frontend will display the appropriate error toast. The service layer is prepared for all 9 operations regardless of backend readiness.
