import type { ChatGatewayAudioReply } from "./chatGateway.types";

const MAX_TTL_MS = 30 * 60 * 1000; // 30 minutes safety cap

export type CachedReplyEntry = {
  reply: string;
  audio?: ChatGatewayAudioReply;
  expiresAt: number;
  responseId?: string;
  sessionId?: string;
  correlationId?: string;
  cacheControl?: string;
};

const store = new Map<string, CachedReplyEntry>();

export function buildRequestKey(text: string): string {
  // DJB2 hash (simple, stable, sync, no deps)
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  }
  // tag with length to reduce collisions further
  return `t:${text.length}:${(hash >>> 0).toString(36)}`;
}

export function parseCacheControlMaxAgeMs(header: string | null | undefined): number | null {
  if (!header) return null;
  const lower = header.toLowerCase();
  if (lower.includes("no-store") || lower.includes("no-cache") || lower.includes("private")) {
    return null;
  }
  const match = lower.match(/max-age\s*=\s*(\d+)/);
  if (!match) return null;
  const seconds = Number.parseInt(match[1], 10);
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.min(seconds * 1000, MAX_TTL_MS);
}

function isExpired(entry: CachedReplyEntry, now: number): boolean {
  return entry.expiresAt <= now;
}

export const chatResponseCache = {
  get(key: string): CachedReplyEntry | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (isExpired(entry, Date.now())) {
      store.delete(key);
      return null;
    }
    return entry;
  },

  set(key: string, entry: Omit<CachedReplyEntry, "expiresAt">, ttlMs: number): void {
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) return;
    const expiresAt = Date.now() + Math.min(ttlMs, MAX_TTL_MS);
    store.set(key, { ...entry, expiresAt });
  },

  clear(): void {
    store.clear();
  },

  /** Test-only. Returns the current size of the underlying store. */
  size(): number {
    return store.size;
  },
};
