# Data Model: Follow-up Admin Panel

**Date**: 2026-08-26 | **Status**: Complete

## Type Definitions (TypeScript)

### Follow-up Queue Entry

```typescript
type FollowUpStatus = 'pendente' | 'aprovado' | 'enviado' | 'descartado' | 'opt_out'
type SessionOutcome = 'fechado' | 'pensando' | 'sem_resposta' | 'recusado' | 'em_andamento'

interface FollowUpQueueEntry {
  id: string
  tenantId: string
  baseThreadId: string
  outcome: SessionOutcome
  summary: string // ~150-250 tokens
  draftMessage: string
  status: FollowUpStatus
  attempts: number
  createdAt: string // ISO-8601
  approvedBy?: string // user ID
  approvedAt?: string // ISO-8601
}

interface FollowUpFilters {
  status?: FollowUpStatus | null
  outcome?: SessionOutcome | null
  tenantId?: string | null
  page?: number
  limit?: number
}

interface FollowUpQueueState {
  entries: FollowUpQueueEntry[]
  filters: FollowUpFilters
  loading: boolean
  error: string | null
  totalCount: number
}
```

### Conversation History

```typescript
type MessageRole = 'user' | 'assistant'

interface ConversationMessage {
  id: string
  tenantId: string
  baseThreadId: string
  activeThreadId: string
  role: MessageRole
  content: string // Markdown/plain text
  createdAt: string // ISO-8601
}

interface ConversationHistoryState {
  messages: ConversationMessage[]
  loading: boolean
  error: string | null
  hasMore: boolean // Para paginação
  page: number
}

interface HistorySearchParams {
  tenantId: string
  baseThreadId: string
  page?: number
  limit?: number
}
```

### Tenant Configuration

```typescript
interface OfferInfo {
  text: string // Markdown/plain
  validUntil: string // ISO-8601 date
}

interface TenantConfig {
  id: string
  tenantId: string
  ofertaVigente: OfferInfo | null
  retentionDays: number
  updatedAt: string
}

interface TenantConfigState {
  config: TenantConfig | null
  loading: boolean
  error: string | null
  saving: boolean
}
```

### Admin User Context

```typescript
interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'cs' | 'vendas'
}

interface AdminAuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isAdmin: boolean
}
```

### API Request/Response Types

```typescript
// GET /follow-up-queue
interface ListFollowUpResponse {
  data: FollowUpQueueEntry[]
  total: number
  page: number
  limit: number
}

// PATCH /follow-up-queue/:queueId
interface UpdateFollowUpRequest {
  status: FollowUpStatus
  draftMessage?: string // Se editado
  approvedBy?: string
}

interface UpdateFollowUpResponse {
  data: FollowUpQueueEntry
  success: boolean
}

// GET /conversation-history/:tenantId/:baseThreadId
interface ListConversationResponse {
  data: ConversationMessage[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// GET /tenants/:tenantId
interface GetTenantResponse {
  data: TenantConfig
}

// PATCH /tenants/:tenantId
interface UpdateTenantRequest {
  ofertaVigente?: OfferInfo | null
  retentionDays?: number
}

interface UpdateTenantResponse {
  data: TenantConfig
  success: boolean
}

// Error Response (todas as endpoints)
interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
```

---

## Validation Schemas (Zod)

```typescript
import { z } from 'zod'

// Validar edição de draft
export const EditDraftSchema = z.object({
  draftMessage: z.string()
    .min(1, 'Rascunho não pode estar vazio')
    .max(1000, 'Rascunho muito longo'),
})

// Validar aprovação (com checagem de oferta)
export const ApproveFollowUpSchema = z.object({
  queueId: z.string(),
  draftMessage: z.string(),
  tenantOferta: z.string().optional(),
}).refine((data) => {
  // Lógica: se draft contém "desconto", validar contra oferta
  if (data.draftMessage.toLowerCase().includes('desconto')) {
    return data.tenantOferta !== undefined
  }
  return true
}, {
  message: 'Desconto mencionado mas oferta não definida para tenant',
})

// Validar config de tenant
export const UpdateTenantConfigSchema = z.object({
  ofertaVigente: z.object({
    text: z.string().min(1),
    validUntil: z.string().datetime(),
  }).nullable(),
  retentionDays: z.number().int().positive('Deve ser > 0'),
})
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
  ├── updateStatus(id, status)
  ├── editDraft(id, newText)
  └── applyFilters(filters)

<ConversationContext>
  ├── state: ConversationHistoryState
  ├── loadHistory(tenantId, threadId)
  └── loadMore()

<TenantConfigContext>
  ├── config: TenantConfig
  ├── updateConfig(oferta, retentionDays)
  └── fetchConfig(tenantId)
```

---

## Entity Relationships

```
Tenant
  ├─ TenantConfig (1:1)
  │   └─ OfferInfo
  └─ FollowUpQueueEntry (1:N)
      └─ ConversationMessage (1:N via baseThreadId)

AdminUser
  └─ role (determines access to FollowUpContext, TenantConfigContext)
```

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| FollowUpQueueEntry | draftMessage | Não pode conter oferta fora de `tenantConfig.ofertaVigente` |
| FollowUpQueueEntry | status | Transição: pendente → aprovado/descartado/opt_out (sem volta) |
| OfferInfo | validUntil | Deve ser data futura (validar no form) |
| TenantConfig | retentionDays | > 0 (não pode ser zero ou negativo) |
| ConversationMessage | content | Rendered como markdown (sanitizado via DOMPurify) |

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

ENVIADO é set apenas pelo worker/cron (EDI-53, out-of-scope para this feature)
```

---

## API Response Handling

Todas as respostas devem ser tratadas com:

1. **Success path**: Atualizar Context + toast de confirmação
2. **Error path**: Exibir erro em toast; manter dados anteriores no Context
3. **Loading**: Exibir spinner ou disabled states em botões/inputs

```typescript
// Exemplo hook
const { status, error, data } = useUpdateFollowUp(queueId, { status: 'aprovado' })

if (status === 'loading') return <Spinner />
if (status === 'error') return <Toast variant="error" message={error} />
if (status === 'success') {
  // Context actualiza; component re-renderiza
  return <Toast variant="success" message="Aprovado!" />
}
```
