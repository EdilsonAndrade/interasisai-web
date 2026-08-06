# Contract: localStorage Session Management

**Version**: v1
**Key**: `chat_thread_id`

## Overview

The frontend uses `localStorage` to persist the `thread_id` (UUID v4) across page reloads. This ensures conversation continuity — the backend Python uses `thread_id` to maintain chat context.

## Contract

### Key Name

```
chat_thread_id
```

### Value Format

```
UUID v4 string
```

**Example**: `"550e8400-e29b-41d4-a716-446655440000"`

### Write Behavior

| Scenario | Action |
|----------|--------|
| First visit (no key exists) | Generate UUID via `crypto.randomUUID()`, write to `localStorage.setItem("chat_thread_id", uuid)` |
| localStorage unavailable | Store UUID in memory (`Map<string, string>`); skip write attempt |

### Read Behavior

| Scenario | Action |
|----------|--------|
| Key exists and valid | `localStorage.getItem("chat_thread_id")` → use value |
| Key exists but corrupted (not UUID v4) | Regenerate UUID, overwrite key |
| Key does not exist | Generate UUID, write key |
| localStorage unavailable | Generate UUID, use in-memory only |
| localStorage read throws | Generate UUID, use in-memory only |

### UUID v4 Validation

```typescript
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
```

### Module Interface

```typescript
// src/services/sessionManager.ts

export function getThreadId(): string;
// Returns existing thread_id from localStorage, or generates new one.
// Never throws — falls back to in-memory UUID.

export function resetThreadId(): string;
// Generates new UUID, overwrites localStorage (if available), returns new id.
// Use when backend rejects thread_id as expired.
```

### Test Contract

```typescript
// Behavior under test:
// 1. getThreadId() returns UUID v4 when localStorage is empty
// 2. getThreadId() returns same UUID on subsequent calls
// 3. getThreadId() returns persisted value after page reload (simulated)
// 4. getThreadId() works when localStorage.setItem throws (QuotaExceededError)
// 5. getThreadId() works when localStorage.getItem throws (SecurityError)
// 6. resetThreadId() generates new UUID different from previous
// 7. resetThreadId() overwrites localStorage with new UUID
```
