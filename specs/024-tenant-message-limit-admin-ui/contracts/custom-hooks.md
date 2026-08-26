# Custom Hook Contracts: Limite de mensagens por tenant — UI Admin

**Version**: 1.0 | **Date**: 2026-08-25

## Hook: useGetTenantUsage

**Location**: `src/hooks/useTenantUsage.ts`

**Purpose**: Fetch and manage `GET /tenants/{id}/usage` lifecycle (loading, success, error, retry).

### Signature

```typescript
function useGetTenantUsage(
  tenantId: string
): {
  usage: TenantUsage | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};
```

### Parameters

- **tenantId** (`string`): Tenant ID to fetch usage for. Changes trigger refetch.

### Return

| Field | Type | Description |
|-------|------|-------------|
| `usage` | `TenantUsage \| null` | Fetched usage data; `null` while loading or error |
| `loading` | `boolean` | `true` during fetch, `false` after completion (success or error) |
| `error` | `Error \| null` | Error object if fetch failed; `null` if success |
| `refetch` | `() => Promise<void>` | Manual refetch function; resolves when fetch completes |

### Behavior

- Fetch on mount and whenever `tenantId` changes (dependency array: `[tenantId]`)
- If `tenantId` is empty/falsy: skip fetch (return `{ usage: null, loading: false, error: null, refetch }`)
- On success: parse response with `tenantUsageSchema` (Zod), cache in state
- On error (network, 4xx, 5xx): store error, don't throw (let caller decide UI)
- Never retry automatically; let caller use `refetch()` for manual retry
- Timeout: use backend timeout (default 30s) or explicit timeout (5s) if specified

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Network error | `error.message = "Network error: ..."`, usage = null |
| 404 Tenant not found | `error.message = "Tenant not found"`, usage = null |
| 500 Server error | `error.message = "Server error"`, usage = null |
| Invalid response shape | `error.message = "Invalid response"`, usage = null |

### Testing

```typescript
describe("useGetTenantUsage", () => {
  it("should fetch usage on mount", async () => {
    const { result } = renderHook(
      () => useGetTenantUsage("tenant-123"),
      { wrapper: MockProvider }
    );
    
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.usage).toEqual({ /* ... */ });
  });
  
  it("should handle 404 gracefully", async () => {
    mockPythonBackend.get.mockRejectedValueOnce({ status: 404 });
    // ... assert error is set, usage is null, no throw
  });
  
  it("should refetch on tenantId change", async () => {
    const { result, rerender } = renderHook(
      ({ id }) => useGetTenantUsage(id),
      { initialProps: { id: "tenant-1" }, wrapper: MockProvider }
    );
    
    await waitFor(() => expect(result.current.usage?.tenant_id).toBe("tenant-1"));
    
    rerender({ id: "tenant-2" });
    await waitFor(() => expect(result.current.usage?.tenant_id).toBe("tenant-2"));
  });
});
```

---

## Hook: useGetMessageLimitConfig

**Location**: `src/hooks/useMessageLimitConfig.ts`

**Purpose**: Fetch and cache `GET /tenants/message-limit-config` (used by calculator + field hint).

### Signature

```typescript
function useGetMessageLimitConfig(): {
  config: TenantMessageLimitConfig | null;
  loading: boolean;
  error: Error | null;
};
```

### Return

| Field | Type | Description |
|-------|------|-------------|
| `config` | `TenantMessageLimitConfig \| null` | Cached config; `null` while loading or error |
| `loading` | `boolean` | `true` on first fetch, `false` after completion |
| `error` | `Error \| null` | Error object if fetch failed; `null` if success |

### Behavior

- Fetch once per app session (cache via custom hook or Context)
- No dependency array; no refetch on prop changes (config is global, not tenant-specific)
- On error: use reasonable defaults (worst_case=3, average=3) for calculator and field hint
- No manual refetch function (not needed; config is stable per deployment)

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Network error | Use defaults (worst=3, avg=3), log error |
| 5xx Server error | Use defaults, log error |
| Invalid response | Use defaults, log error |

### Testing

```typescript
describe("useGetMessageLimitConfig", () => {
  it("should fetch config on first mount only", async () => {
    const { result: result1 } = renderHook(() => useGetMessageLimitConfig());
    const { result: result2 } = renderHook(() => useGetMessageLimitConfig());
    
    await waitFor(() => expect(result1.current.loading).toBe(false));
    // Second hook should reuse cached config (same object reference)
    expect(result1.current.config).toBe(result2.current.config);
  });
  
  it("should use defaults on network error", async () => {
    mockPythonBackend.get.mockRejectedValueOnce(new Error("Network"));
    const { result } = renderHook(() => useGetMessageLimitConfig());
    
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.config).toEqual({
      worst_case_calls_per_message: 3,
      average_calls_per_message: 3,
    });
  });
});
```

---

## Hook: useGlobalRecipientsManager

**Location**: `src/hooks/useGlobalRecipientsManager.ts`

**Purpose**: Manage CRUD operations for `GET/POST/PUT/DELETE /global-notification-recipients/`.

### Signature

```typescript
function useGlobalRecipientsManager(): {
  recipients: GlobalRecipient[];
  loading: boolean;
  error: Error | null;
  
  list: () => Promise<void>;
  create: (email: string) => Promise<GlobalRecipient>;
  update: (id: number, active: boolean) => Promise<GlobalRecipient>;
  delete: (id: number) => Promise<void>;
};
```

### Return

| Field | Type | Description |
|-------|------|-------------|
| `recipients` | `GlobalRecipient[]` | Current list; updates in-place on CRUD |
| `loading` | `boolean` | `true` during initial list fetch |
| `error` | `Error \| null` | Error from most recent list fetch (not from individual CRUD) |
| `list` | `() => Promise<void>` | Fetch recipients list (called on hook mount, can be called manually) |
| `create` | `(email: string) => Promise<GlobalRecipient>` | Add new recipient; resolves with created entity |
| `update` | `(id: number, active: boolean) => Promise<GlobalRecipient>` | Toggle active state; resolves with updated entity |
| `delete` | `(id: number) => Promise<void>` | Remove recipient; resolves when deleted |

### Behavior

- Call `list()` on mount
- `create()`, `update()`, `delete()` update the local `recipients` array optimistically (assume success)
- On error from CRUD operation: throw error (caller handles in try/catch); **do not** roll back local state (let caller decide)
- Individual CRUD errors do not update the `error` field (only list fetch errors do)
- `create()` with duplicate email: throw error with status=409 and code="EMAIL_ALREADY_EXISTS"

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Network error on list | `error` is set, `recipients` empty |
| 409 Duplicate email | `create()` throws error with `status=409`, original list unchanged |
| 404 Not found (update/delete) | Operation throws error with `status=404`, local list rolls back |
| 422 Invalid e-mail | `create()` throws error with field validation details |

### Testing

```typescript
describe("useGlobalRecipientsManager", () => {
  it("should fetch recipients on mount", async () => {
    const { result } = renderHook(() => useGlobalRecipientsManager());
    
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.recipients).toHaveLength(2); // mock data
  });
  
  it("should create recipient and update list", async () => {
    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.recipients).toBeDefined());
    
    const newRecipient = await result.current.create("new@interasisai.com");
    expect(newRecipient.email).toBe("new@interasisai.com");
    expect(result.current.recipients).toContainEqual(newRecipient);
  });
  
  it("should reject duplicate email with 409", async () => {
    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.recipients).toBeDefined());
    
    mockPythonBackend.post.mockRejectedValueOnce({
      status: 409,
      detail: { code: "EMAIL_ALREADY_EXISTS" },
    });
    
    await expect(result.current.create("duplicate@interasisai.com"))
      .rejects
      .toMatch(/EMAIL_ALREADY_EXISTS/);
  });
  
  it("should toggle active without removing recipient", async () => {
    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.recipients).toBeDefined());
    
    const recipient = result.current.recipients[0];
    const updated = await result.current.update(recipient.id, false);
    
    expect(updated.active).toBe(false);
    expect(result.current.recipients).toContainEqual(updated); // not deleted
  });
  
  it("should delete recipient from list", async () => {
    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.recipients).toBeDefined());
    
    const recipient = result.current.recipients[0];
    await result.current.delete(recipient.id);
    
    expect(result.current.recipients.find(r => r.id === recipient.id)).toBeUndefined();
  });
});
```

---

## Summary

| Hook | Purpose | Caching | Error Handling |
|------|---------|---------|----------------|
| `useGetTenantUsage` | Read usage per tenant | None (fresh on each tenantId) | Store error, don't throw |
| `useGetMessageLimitConfig` | Read global config | Cache per session | Use defaults on error |
| `useGlobalRecipientsManager` | CRUD recipients list | In-memory list array | Throw on individual CRUD; caller catches |

---

**Status**: Hook contracts complete. Ready for implementation phase.
