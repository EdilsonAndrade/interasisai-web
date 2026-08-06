# Contract: Python Backend Chat API

**Version**: v1
**Base URL**: `{NEXT_PUBLIC_PYTHON_BACKEND_URL}` (default: `http://localhost:8000`)

## POST /api/v1/chat

Send a text message to the AI assistant and receive a response.

### Request

**Method**: `POST`
**URL**: `{baseUrl}/api/v1/chat`

**Headers**:

| Name | Value | Required |
|------|-------|----------|
| `X-Tenant-ID` | Tenant identifier (from `NEXT_PUBLIC_TENANT_ID`) | Yes |
| `Content-Type` | `application/json` | Yes |

**Body** (JSON):

```json
{
  "message": "Olá, gostaria de agendar um corte de cabelo para amanhã às 14:00",
  "thread_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `message` | `string` | Yes | Max 4000 characters; non-empty after trim |
| `thread_id` | `string` (UUID v4) | Yes | Identifies the conversation session |

### Response — Success (200 OK)

```json
{
  "tenant_id": "987654",
  "status": "success",
  "response": "Perfeito! Verifiquei que o horário das 14:00 amanhã está disponível com o barbeiro Daniel. Qual o seu nome e e-mail para confirmar a reserva?"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tenant_id` | `string` | Tenant that processed the request |
| `status` | `"success"` | Always `"success"` for 200 responses |
| `response` | `string` | AI assistant's reply text |

### Response — Gateway Timeout (504)

```json
{
  "detail": "O serviço de atendimento demorou para responder. Por favor, tente novamente em instantes."
}
```

**Frontend behavior**: Display friendly message, allow retry.

### Response — Internal Server Error (500)

```json
{
  "detail": "Erro interno no motor de IA. Nossa equipe foi notificada."
}
```

**Frontend behavior**: Display friendly message, allow retry.

### Frontend Contract Mapping

```typescript
type PythonChatRequest = {
  message: string;
  thread_id: string;
};

type PythonChatSuccessResponse = {
  tenant_id: string;
  status: "success";
  response: string;
};

type PythonChatErrorResponse = {
  detail: string;
};
```

**Error handling rules**:
- HTTP 200: Extract `response` → `ChatMessage.content`
- HTTP 504: Show timeout message, retryable
- HTTP 500: Show error message, retryable
- Network error (fetch throws): Show connection error, retryable
- Missing/invalid `response` field: Fallback to `"Recebemos sua mensagem e já estamos processando."`
