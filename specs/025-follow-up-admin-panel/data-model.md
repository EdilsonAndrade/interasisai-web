# Data Model: Follow-up Admin Panel

**Date**: 2026-08-26 | **Status**: Updated for real API contracts

## Type Definitions (TypeScript)

### Follow-up Queue Entry

```typescript
type FollowUpStatus = 'pendente' | 'aprovado' | 'enviado' | 'descartado' | 'opt_out'
type SessionOutcome = 'fechado' | 'pensando' | 'sem_resposta' | 'recusado' | 'em_andamento'

interface FollowUpQueueEntry {
  id: number  // Backend retorna int
  base_thread_id: string  // e.g., "acme:123"
  outcome: SessionOutcome
  summary: string
  draft_message: string
  status: FollowUpStatus
  created_at: string  // ISO-8601
}

interface FollowUpQueueResponse {
  tenant_id: string
  entries: FollowUpQueueEntry[]
}

interface FollowUpFilters {
  status?: FollowUpStatus | null
}

interface FollowUpQueueState {
  entries: FollowUpQueueEntry[]
  filters: FollowUpFilters
  loading: boolean
  error: string | null
}
```

**Key Differences from Old Model**:
- `id` é `number`, não `string`
- `baseThreadId` → `base_thread_id` (snake_case)
- `createdAt` → `created_at`
- `draftMessage` → `draft_message`
- Sem `attempts`, `approvedBy`, `approvedAt` no response GET (adicionados em PATCH)
- **Sem filtro por `outcome`** — apenas `status`
- **Sem `tenantId` no entry** — vem no response root

---

### Conversation History

```typescript
type MessageRole = 'human' | 'ai'

interface ConversationMessage {
  role: MessageRole  // 'human' (cliente) ou 'ai' (atendente)
  content: string
  created_at: string  // ISO-8601
}

interface ConversationHistory {
  tenant_id: string
  base_thread_id: string
  messages: ConversationMessage[]
}

interface ConversationHistoryState {
  messages: ConversationMessage[]
  loading: boolean
  error: string | null
}

interface HistorySearchParams {
  tenantId: string
  baseThreadId: string
  limit?: number  // default 200, max 500
  before?: string  // datetime para paginação reversa
}
```

**Key Differences from Old Model**:
- `role` é `'human'` ou `'ai'`, não `'user'` ou `'assistant'`
- Sem `id` nas mensagens
- Sem `activeThreadId` nem `tenantId` por mensagem
- `created_at` em snake_case
- Paginação via `limit` + `before`, não `page`
- Ordem: cronológica ascendente

---

### Tenant Configuration

```typescript
interface TenantConfig {
  id: string
  name: string
  google_calendar_id: string
  allowed_domains: string[]
  oferta_vigente_texto?: string | null
  oferta_vigente_validade?: string | null  // ISO-8601 date
  retention_days: number
  // ... outros campos
}

interface TenantConfigState {
  config: TenantConfig | null
  loading: boolean
  error: string | null
  saving: boolean
}

interface UpdateTenantPayload {
  // Objeto completo — requer name, google_calendar_id, etc
  name: string
  google_calendar_id: string
  allowed_domains: string[]
  oferta_vigente_texto?: string | null
  oferta_vigente_validade?: string | null
  retention_days: number
  // ... outros campos obrigatórios
}
```

**Key Differences from Old Model**:
- Sem `OfferInfo` nested — campos `oferta_vigente_texto` e `oferta_vigente_validade` são diretos
- `PUT /tenants/{id}` requer objeto **completo**, não partial
- Frontend deve buscar tenant inteiro antes de atualizar

---

### API Request/Response Types

```typescript
// GET /tenants/{tenant_id}/follow-up-queue
interface FollowUpQueueResponse {
  tenant_id: string
  entries: FollowUpQueueEntry[]
}

// PATCH /tenants/{tenant_id}/follow-up-queue/{entry_id}
interface UpdateFollowUpRequest {
  status?: FollowUpStatus
  draft_message?: string
  approved_by?: string
}

interface UpdateFollowUpResponse extends FollowUpQueueEntry {}

// GET /tenants/{tenant_id}/conversation-history/{base_thread_id}
interface ConversationHistoryResponse {
  tenant_id: string
  base_thread_id: string
  messages: ConversationMessage[]
}

// GET /tenants/{tenant_id}
interface TenantResponse extends TenantConfig {}

// PUT /tenants/{tenant_id}
interface UpdateTenantRequest extends TenantConfig {}
interface UpdateTenantResponse extends TenantConfig {}

// Error
interface ApiErrorResponse {
  detail: string  // Error message
}
```

---

## State Management Architecture

### Context Structure

```
<AdminAuthContext>
  ├── user: AdminUser
  ├── isAdmin: boolean
  └── checkPermissions()

<FollowUpContext>
  ├── state: FollowUpQueueState
  ├── filters: FollowUpFilters
  ├── updateEntryStatus(id, status)
  └── setEntries(entries)

<TenantContext> (optional)
  ├── tenants: TenantConfig[]
  ├── selectedTenant: TenantConfig | null
  └── selectTenant(id)
```

---

## Entity Relationships

```
Tenant
  ├─ FollowUpQueueEntry (1:N via base_thread_id)
  │   └─ ConversationMessage (1:N via base_thread_id)
  └─ Config (oferta_vigente_texto, retention_days)

AdminUser
  └─ role (determines access to Follow-up Queue, Config)
```

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| FollowUpQueueEntry | `draft_message` | Não pode conter oferta fora de `tenant.oferta_vigente_texto` |
| FollowUpQueueEntry | `status` | Transição: pendente → aprovado/descartado/opt_out (sem volta) |
| TenantConfig | `retention_days` | > 0 (não pode ser zero ou negativo) |
| TenantConfig | `oferta_vigente_validade` | Deve ser data futura (validar no form) |
| ConversationMessage | `content` | Rendered como markdown (sanitizado via DOMPurify) |

---

## State Transitions

### Follow-up Queue Entry

```
┌─────────────┐
│  PENDENTE   │ (rascunho aguardando revisão)
└──────┬──────┘
       │
       ├─→ ┌──────────┐ (usuário aprova)
       │   │ APROVADO │
       │   └──────────┘
       │
       ├─→ ┌────────────┐ (usuário descarta)
       │   │ DESCARTADO │
       │   └────────────┘
       │
       └─→ ┌─────────┐ (cliente opt-out)
           │ OPT_OUT │
           └─────────┘

ENVIADO é set apenas pelo worker/cron (backend, out-of-scope para this feature)
```

---

## Field Mapping: Backend Response → Frontend Types

| Backend Response | Frontend Type | Notes |
|------------------|---------------|-------|
| `id` (int) | `number` | - |
| `base_thread_id` | `string` | Use como-é |
| `outcome` | `SessionOutcome` | Enum validation |
| `summary` | `string` | Display apenas |
| `draft_message` | `string` | Editável no modal |
| `status` | `FollowUpStatus` | Enum validation |
| `created_at` | `string` | Formatado via `formatDate()` |
| `role` (history) | `MessageRole` | 'human' \| 'ai' |
| `content` (history) | `string` | Renderizado como markdown |

---

## API Response Handling

Todas as respostas devem ser tratadas com:

1. **Success path**: Atualizar Context + toast de confirmação
2. **Error path**: Exibir erro em toast; manter dados anteriores no Context
3. **Loading**: Exibir spinner ou disabled states em botões/inputs

```typescript
// Exemplo hook
const { status, error, data } = useFollowUpQueue()

if (status === 'loading') return <Spinner />
if (status === 'error') return <Toast variant="error" message={error} />
if (status === 'success') {
  // Context atualiza; component re-renderiza
  return <Toast variant="success" message="Aprovado!" />
}
```
