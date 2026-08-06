// ============================================================================
// Session Manager — Chat thread_id management
// Generates and persists UUID v4 thread_id via localStorage
// Falls back to in-memory Map when localStorage is unavailable
// ============================================================================

const STORAGE_KEY = "chat_thread_id";

// UUID v4 regex for validation
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** In-memory fallback storage when localStorage is unavailable */
const memoryStore = new Map<string, string>();

function isLocalStorageAvailable(): boolean {
  try {
    const key = "__session_test__";
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function generateUUID(): string {
  return crypto.randomUUID();
}

function isValidUUIDv4(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

function readPersisted(): string | null {
  if (!isLocalStorageAvailable()) {
    return memoryStore.get(STORAGE_KEY) ?? null;
  }

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && isValidUUIDv4(value)) {
      return value;
    }
    // Corrupted or invalid — clear it
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    // SecurityError or similar
    return memoryStore.get(STORAGE_KEY) ?? null;
  }
}

function persistThreadId(threadId: string): void {
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEY, threadId);
    } catch {
      // QuotaExceededError — fall back to memory only
    }
  }
  // Always store in memory as fallback
  memoryStore.set(STORAGE_KEY, threadId);
}

/**
 * Returns the current thread_id for the chat session.
 * On first visit: generates a new UUID v4 and persists it.
 * On subsequent visits: returns the persisted UUID from localStorage.
 * When localStorage is unavailable: uses in-memory storage (no cross-reload persistence).
 *
 * Never throws — always returns a valid UUID v4 string.
 */
export function getThreadId(): string {
  const existing = readPersisted();
  if (existing) {
    return existing;
  }

  const newId = generateUUID();
  persistThreadId(newId);
  return newId;
}

/**
 * Generates a new thread_id, overwriting the existing one.
 * Use when the backend rejects the current thread_id as expired.
 *
 * Never throws — always returns a valid UUID v4 string.
 */
export function resetThreadId(): string {
  const newId = generateUUID();
  persistThreadId(newId);
  return newId;
}
