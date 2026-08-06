import {
  buildRequestKey,
  chatResponseCache,
  parseCacheControlMaxAgeMs,
} from "./chatResponseCache";

describe("chatResponseCache", () => {
  beforeEach(() => {
    chatResponseCache.clear();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("buildRequestKey", () => {
    it("é determinístico para a mesma string", () => {
      expect(buildRequestKey("olá")).toBe(buildRequestKey("olá"));
    });

    it("difere para strings diferentes", () => {
      expect(buildRequestKey("a")).not.toBe(buildRequestKey("b"));
    });
  });

  describe("parseCacheControlMaxAgeMs", () => {
    it("retorna null para header ausente", () => {
      expect(parseCacheControlMaxAgeMs(null)).toBeNull();
      expect(parseCacheControlMaxAgeMs(undefined)).toBeNull();
      expect(parseCacheControlMaxAgeMs("")).toBeNull();
    });

    it("retorna null para no-store", () => {
      expect(parseCacheControlMaxAgeMs("no-store")).toBeNull();
      expect(parseCacheControlMaxAgeMs("public, no-store, max-age=60")).toBeNull();
    });

    it("retorna 0 para max-age=0", () => {
      expect(parseCacheControlMaxAgeMs("max-age=0")).toBe(0);
    });

    it("retorna ms para max-age=N", () => {
      expect(parseCacheControlMaxAgeMs("max-age=60")).toBe(60_000);
      expect(parseCacheControlMaxAgeMs("public, max-age=120")).toBe(120_000);
    });

    it("limita o TTL a 30 minutos", () => {
      const result = parseCacheControlMaxAgeMs("max-age=999999");
      expect(result).toBe(30 * 60 * 1000);
    });
  });

  describe("set/get/expiration", () => {
    it("armazena e recupera entrada antes do TTL", () => {
      chatResponseCache.set("k", { reply: "hi" }, 60_000);
      expect(chatResponseCache.get("k")?.reply).toBe("hi");
    });

    it("retorna null após expiração", () => {
      jest.useFakeTimers();
      const start = new Date("2026-04-30T10:00:00Z").getTime();
      jest.setSystemTime(start);

      chatResponseCache.set("k", { reply: "hi" }, 1_000);

      jest.setSystemTime(start + 999);
      expect(chatResponseCache.get("k")?.reply).toBe("hi");

      jest.setSystemTime(start + 1_000);
      expect(chatResponseCache.get("k")).toBeNull();
    });

    it("ignora TTL <= 0", () => {
      chatResponseCache.set("k", { reply: "hi" }, 0);
      expect(chatResponseCache.get("k")).toBeNull();
      chatResponseCache.set("k", { reply: "hi" }, -1);
      expect(chatResponseCache.get("k")).toBeNull();
    });

    it("clear() esvazia o store", () => {
      chatResponseCache.set("k1", { reply: "a" }, 60_000);
      chatResponseCache.set("k2", { reply: "b" }, 60_000);
      expect(chatResponseCache.size()).toBe(2);
      chatResponseCache.clear();
      expect(chatResponseCache.size()).toBe(0);
    });
  });
});
