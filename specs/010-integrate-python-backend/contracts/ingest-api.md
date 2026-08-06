# Contract: Knowledge Base Ingest API

**Version**: v1
**Base URL**: `{NEXT_PUBLIC_PYTHON_BACKEND_URL}` (default: `http://localhost:8000`)

## POST /api/v1/ingest/text

Send business rules / institutional text for vectorization in the RAG knowledge base.

### Request

**Method**: `POST`
**URL**: `{baseUrl}/api/v1/ingest/text`

**Headers**:

| Name | Value | Required |
|------|-------|----------|
| `X-Tenant-ID` | Tenant identifier (from admin form input) | Yes |
| `Content-Type` | `application/json` | Yes |

**Body** (JSON):

```json
{
  "text_content": "A Barbearia Silva funciona de segunda a sábado das 09:00 às 19:00. O corte de cabelo custa R$ 50,00 e a barba R$ 35,00. O barbeiro Daniel atende de terça a sábado..."
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `text_content` | `string` | Yes | Max 100,000 characters (frontend limit); non-empty after trim |

### Response — Success (201 Created)

```json
{
  "tenant_id": "987654",
  "status": "processing",
  "message": "A tarefa de vetorização foi agendada e está sendo processada em segundo plano."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tenant_id` | `string` | Tenant that received the text |
| `status` | `"processing"` | Always `"processing"` for 201 responses |
| `message` | `string` | Description of the processing status |

### Response — Error (400/500)

Error responses follow the same pattern as the chat API:

```json
{
  "detail": "Error description"
}
```

**Frontend behavior**: Display error message from `detail` field, allow correction and resubmission.

### Frontend Contract Mapping

```typescript
type IngestRequest = {
  text_content: string;
};

type IngestSuccessResponse = {
  tenant_id: string;
  status: "processing";
  message: string;
};

type IngestErrorResponse = {
  detail: string;
};
```

**UI feedback rules**:
- HTTP 201: Show success toast/message with `message` field content
- HTTP 4xx/5xx: Show error with `detail` field content; form remains editable
- Network error: Show connection error; form remains editable

### Important Note

The `X-Tenant-ID` for the ingest endpoint comes from the **admin form input**, NOT from the environment variable `NEXT_PUBLIC_TENANT_ID`. This allows administrators to ingest knowledge for different tenants without changing environment configuration.
