# Data Model & State Management: Limite de mensagens por tenant — UI Admin

**Version**: 1.0 | **Date**: 2026-08-25

## Entities & Types

### TenantUsage (Read-only, via API)

**Source**: `GET /tenants/{id}/usage` (backend endpoint)

```typescript
type TenantUsage = {
  tenant_id: string;
  monthly_message_limit: number | null;       // null = sem limite
  current_month_calls: number;                // chamadas de LLM contabilizadas no mês
  percentage_used: number | null;             // (current / limit) * 100; null se sem limite
  blocked: boolean;                           // true se current >= limit
};
```

**Validation Rules**:
- `monthly_message_limit` ≥ 0 ou `null`
- `current_month_calls` ≥ 0
- `percentage_used` em [0, 100] ou `null`
- `blocked` é função de `current_month_calls >= monthly_message_limit` (derivado, não persistido na UI)

**State Transitions**:
- Carregamento: `null` (initial) → `loading` (fetching) → `success` (TenantUsage) | `error` (Exception)
- Atualização: trigger via mudança do tenant_id ou refresh manual

### TenantMessageLimitConfig (Read-only, via API, cached)

**Source**: `GET /tenants/message-limit-config` (backend endpoint)

```typescript
type TenantMessageLimitConfig = {
  worst_case_calls_per_message: number;       // ex: 3 (routing_agent + operational_node + retry)
  average_calls_per_message: number;          // ex: 3.0 (configurável, today = worst_case)
};
```

**Validation Rules**:
- Ambos > 0
- `average_calls_per_message` ≤ `worst_case_calls_per_message` (invariante de negócio)

**State Transitions**:
- Carregamento único ao montar a app/page (cached, não re-fetch a cada operação)
- Falha ao carregar: usar defaults conservadores (worst_case=3, average=3.0) ou degradar

### GlobalRecipient (Entity, via API CRUD)

**Source**: CRUD `/global-notification-recipients/` (backend endpoints)

```typescript
type GlobalRecipient = {
  id: number;
  email: string;                              // EmailStr (validado no backend)
  active: boolean;                            // ativo/inativo, sem apagar
  created_at: string;                         // ISO 8601
};

type GlobalRecipientCreate = {
  email: string;
};

type GlobalRecipientUpdate = {
  active: boolean;
};
```

**Validation Rules**:
- `email` deve ser válido (Zod `EmailStr` equivalente ou RFC 5322)
- `active` é boolean simples (true = recebe alertas, false = silenciado mas registrado)
- `id` é gerado pelo backend (inteiro positivo)

**State Transitions**:
- Create: `pending` → `success` + append to list | `error` (409 = duplicate)
- Update: `pending` → `success` + update in place | `error` (404 = not found)
- Delete: `pending` → `success` + remove from list | `error` (404 = not found)

### TenantWrite Extensions (Form)

**Source**: Form input + API `POST /tenants/` / `PUT /tenants/{id}`

```typescript
type TenantWriteInput = {
  // existing fields
  name: string;
  google_calendar_id: string;
  allowed_domains: string[];
  scheduling_enabled: boolean;
  
  // NEW (EDI-63)
  monthly_message_limit?: number | null;     // optional, can be cleared to null
  notification_emails?: string[];             // optional, can be empty array
};
```

**Validation Rules** (Zod schema, client-side mirror of backend Pydantic):
- `monthly_message_limit`: integer > 0 or `null` (not present = null)
- `notification_emails`: array of EmailStr, min 0, max 10 (reasonable limit)
- Individual e-mails validated as per RFC 5322 subset (Zod `email()`)

**State Transitions**:
- Form pristine → dirty (user edits) → submitting (API call) → success (persisted) | error (validation failed or server error)
- Clearing `monthly_message_limit`: set to `null` explicitly (not "unset")
- Removing e-mail: splice from array in-place

## Component State Management

### TenantForm (React Hook Form + Zod)

```typescript
type TenantFormState = {
  // From react-hook-form
  formState: {
    isDirty: boolean;
    isSubmitting: boolean;
    errors: Record<string, FieldError>;      // includes new fields
  };
  watch: TenantWriteInput;
};
```

**Behavior**:
- New field `monthly_message_limit` in form (number input, optional, can clear to empty/null)
- New field `notification_emails` with `<EmailListEditor />` component (add/remove UI)
- Validation error on malformed e-mail shows inline in EmailListEditor
- Form save triggers `PUT /tenants/{id}` with all fields (including limit + emails)

### TenantDetails (Consumption + Display)

```typescript
type TenantDetailsState = {
  usage: TenantUsage | null;                  // from useGetTenantUsage() hook
  usageLoading: boolean;
  usageError: Exception | null;
  // tenantData already loaded from TenantManagement
};
```

**Behavior**:
- Renders `<TenantUsageIndicator usage={usage} loading={usageLoading} error={usageError} />`
- If error in usage fetching: show degraded state (greyed out indicator, tooltip: "Uso indisponível")
- If no limit: show neutral state ("Sem limite configurado")

### GlobalNotificationRecipients (Admin Page)

```typescript
type GlobalRecipientsPageState = {
  recipients: GlobalRecipient[];
  recipientsLoading: boolean;
  recipientsError: Exception | null;
  
  createForm: {
    email: string;
    isSubmitting: boolean;
    error: Exception | null;
  };
  
  // per-recipient action state
  actionInProgress: Record<number, boolean>; // id -> isSubmitting
  actionErrors: Record<number, Exception>;   // id -> error
};
```

**Behavior**:
- Initial load: fetch list via `useGlobalRecipientsManager().list()`
- Create new: form + button, validates e-mail, calls `.create(email)`, appends to list on success, shows 409 error clearly
- Update (toggle active): quick action button per row, calls `.update(id, active)`, updates in-place
- Delete: confirm dialog, calls `.delete(id)`, removes from list

### Calculator (Plan Dimensioning)

```typescript
type CalculatorState = {
  scenarioType: "worst_case" | "average";
  llmCallsInput: number | "";                // user input
  config: TenantMessageLimitConfig;          // cached from API
};

type CalculatorComputed = {
  estimatedMessages: number | null;          // (llmCallsInput / ratio).toFixed(0), or null if input invalid
};
```

**Behavior**:
- Inputs: number field (LLM calls) + radio/toggle (scenario type)
- Computed: `estimatedMessages = Math.ceil(llmCallsInput / (scenarioType === "worst_case" ? config.worst_case_calls_per_message : config.average_calls_per_message))`
- Display: "≈ XXX mensagens reais de clientes finais"
- Recalculates on every input change (no debounce, instant feedback)

## Error Handling & Degradation

### API Failure Handling

| Endpoint | Failure Mode | UI Response |
|----------|--------------|------------|
| `GET /tenants/{id}` | 404 | Redirect to tenant list (existing behavior) |
| `GET /tenants/{id}/usage` | Any | Show degraded indicator (grey, tooltip "Indisponível") in TenantDetails; rest of page unaffected |
| `GET /tenants/message-limit-config` | Any | Use defaults (worst=3, avg=3) or hide calculator + field hint; forms still work |
| `POST/PUT /global-notification-recipients/` | 409 (duplicate) | Show inline error message "E-mail já existe" in create form |
| `POST/PUT /global-notification-recipients/` | 404 | (update/delete) Show toast "Item não encontrado"; remove from list if delete |
| `POST/PUT /global-notification-recipients/` | 422 (validation) | Show "E-mail inválido" inline; don't submit |
| `POST/PUT /tenants/{id}` | 422 (validation) | Use existing form error mapping (fieldErrors); highlight fields |

### Local Validation (Client-side)

- E-mail format: validate in real-time as user types in EmailListEditor
- Number fields: reject non-integers or negatives on input
- List length: warn if > 10 e-mails (configurable limit)
- Clear errors on form reset or user re-attempt

## Schema Definitions (Zod)

### tenantUsageSchemas.ts (new file)

```typescript
import { z } from "zod";

export const tenantUsageSchema = z.object({
  tenant_id: z.string(),
  monthly_message_limit: z.number().int().positive().nullable(),
  current_month_calls: z.number().int().nonnegative(),
  percentage_used: z.number().min(0).max(100).nullable(),
  blocked: z.boolean(),
});

export const tenantMessageLimitConfigSchema = z.object({
  worst_case_calls_per_message: z.number().positive(),
  average_calls_per_message: z.number().positive(),
});

export type TenantUsage = z.infer<typeof tenantUsageSchema>;
export type TenantMessageLimitConfig = z.infer<typeof tenantMessageLimitConfigSchema>;
```

### globalRecipientsSchemas.ts (new file)

```typescript
import { z } from "zod";

export const globalRecipientSchema = z.object({
  id: z.number().positive(),
  email: z.string().email(),
  active: z.boolean(),
  created_at: z.string().datetime(),
});

export const globalRecipientCreateSchema = z.object({
  email: z.string().email("E-mail inválido."),
});

export const globalRecipientUpdateSchema = z.object({
  active: z.boolean(),
});

export type GlobalRecipient = z.infer<typeof globalRecipientSchema>;
export type GlobalRecipientCreate = z.infer<typeof globalRecipientCreateSchema>;
export type GlobalRecipientUpdate = z.infer<typeof globalRecipientUpdateSchema>;
```

### tenantSchemas.ts (extend existing)

```typescript
// Add to tenantWriteSchema:
export const tenantWriteSchema = z.object({
  // ... existing fields
  name: z.string().trim().min(1, "O nome do tenant é obrigatório."),
  // ... etc
  
  // NEW
  monthly_message_limit: z.number().int().positive().nullable().optional(),
  notification_emails: z
    .array(z.string().email("E-mail inválido."))
    .max(10, "Máximo 10 e-mails.")
    .default([]),
});

export const tenantCreateSchema = tenantWriteSchema.extend({
  tenant_id: z.string().trim().min(1, "O ID do tenant é obrigatório."),
  prompt_id: z.string().trim().min(1, "Selecione um prompt."),
});
```

## Persistence & Sync

- **TenantUsage**: Fetch-only (read-only from `GET /tenants/{id}/usage`), no local cache (always fresh on page load or manual refresh)
- **TenantMessageLimitConfig**: Fetch once per app session, cache in context or custom hook (reused across calculator + field hint)
- **GlobalRecipient**: Fetch on page load, update list in-place on CRUD operations (optimistic updates where safe)
- **TenantWrite** (form data): React Hook Form manages local state; persisted on submit via `PUT /tenants/{id}`

## UI Color Coding (Design Tokens)

- **Green (<50%)**: `text-green-500`, `border-green-500`, or token `--color-success`
- **Yellow (50-80%)**: `text-yellow-500`, `border-yellow-500`, or token `--color-warning`
- **Red (≥80% or blocked)**: `text-red-500`, `border-red-500`, or token `--color-error`
- **Neutral (no limit)**: `text-gray-400`, `border-gray-400`, or token `--color-secondary`

Consult `src/theme/design-tokens.ts` for exact token names in this project.

---

**Status**: Data model complete. Coordinates with backend contracts and forms clear foundation for Phase 1.5 (contracts) and implementation.
