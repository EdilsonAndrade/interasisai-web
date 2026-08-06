// ============================================================================
// Tests: sessionManager — Thread ID generation, persistence, and fallback
// ============================================================================

import { getThreadId, resetThreadId } from "./sessionManager";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const THREAD_ID_KEY = "chat_thread_id";

beforeEach(() => {
  // Clear localStorage and reset module state between tests
  localStorage.clear();
  // Call resetThreadId to force a fresh state
  resetThreadId();
  // Clear that so next getThreadId generates fresh
  localStorage.clear();
});

describe("sessionManager", () => {
  // -----------------------------------------------------------------------
  // getThreadId
  // -----------------------------------------------------------------------

  describe("getThreadId", () => {
    it("returns a valid UUID v4 on first call (no persisted value)", () => {
      const threadId = getThreadId();
      expect(threadId).toMatch(UUID_V4_REGEX);
    });

    it("persists the generated UUID to localStorage on first call", () => {
      const threadId = getThreadId();
      const stored = localStorage.getItem(THREAD_ID_KEY);
      expect(stored).toBe(threadId);
    });

    it("returns the same thread_id on subsequent calls (from localStorage)", () => {
      const first = getThreadId();
      const second = getThreadId();
      expect(second).toBe(first);
    });

    it("returns the persisted value after simulated page reload", () => {
      const first = getThreadId();
      // Simulate reload: clear localStorage is not done — value persists
      // Just call again — should return same value
      const second = getThreadId();
      expect(second).toBe(first);
    });

    it("works when localStorage is unavailable (falls back to memory)", () => {
      // Mock localStorage to throw on all operations
      const setItemSpy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("QuotaExceededError");
        });
      const getItemSpy = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("SecurityError");
        });

      const threadId = getThreadId();
      expect(threadId).toMatch(UUID_V4_REGEX);

      // Should still work — in-memory fallback
      const second = getThreadId();
      expect(second).toBe(threadId);

      setItemSpy.mockRestore();
      getItemSpy.mockRestore();
    });

    it("regenerates UUID when stored value is corrupted (not UUID v4)", () => {
      localStorage.setItem(THREAD_ID_KEY, "not-a-valid-uuid");
      const threadId = getThreadId();
      expect(threadId).toMatch(UUID_V4_REGEX);
      expect(threadId).not.toBe("not-a-valid-uuid");
    });
  });

  // -----------------------------------------------------------------------
  // resetThreadId
  // -----------------------------------------------------------------------

  describe("resetThreadId", () => {
    it("generates a new UUID different from the previous one", () => {
      const first = getThreadId();
      const reset = resetThreadId();
      expect(reset).toMatch(UUID_V4_REGEX);
      expect(reset).not.toBe(first);
    });

    it("overwrites localStorage with the new UUID", () => {
      getThreadId(); // generates first
      const reset = resetThreadId();
      const stored = localStorage.getItem(THREAD_ID_KEY);
      expect(stored).toBe(reset);
    });

    it("subsequent getThreadId returns the reset value", () => {
      getThreadId(); // first
      const reset = resetThreadId();
      const next = getThreadId();
      expect(next).toBe(reset);
    });
  });
});
