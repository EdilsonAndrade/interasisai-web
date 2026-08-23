import {
  readGuideDisabled,
  readProgress,
  writeGuideDisabled,
  writeProgress,
} from "./onboardingGuideStorage";

beforeEach(() => {
  localStorage.clear();
});

describe("onboardingGuideStorage", () => {
  describe("guide disabled flag", () => {
    it("defaults to enabled (not disabled) when nothing was saved", () => {
      expect(readGuideDisabled()).toBe(false);
    });

    it("persists true across reads once disabled", () => {
      writeGuideDisabled(true);
      expect(readGuideDisabled()).toBe(true);
      expect(localStorage.getItem("onboarding_guide_disabled")).toBe("true");
    });

    it("clears the flag when re-enabled", () => {
      writeGuideDisabled(true);
      writeGuideDisabled(false);
      expect(readGuideDisabled()).toBe(false);
      expect(localStorage.getItem("onboarding_guide_disabled")).toBeNull();
    });
  });

  describe("per-tenant progress", () => {
    it("returns an empty list for a tenant with no saved progress", () => {
      expect(readProgress("tenant-1")).toEqual([]);
    });

    it("persists and reads back marked steps for a specific tenant", () => {
      writeProgress("tenant-1", ["operational_prompt", "identity_guardrail"]);
      expect(readProgress("tenant-1")).toEqual(["operational_prompt", "identity_guardrail"]);
    });

    it("keeps progress isolated between different tenants", () => {
      writeProgress("tenant-1", ["operational_prompt"]);
      writeProgress("tenant-2", ["knowledge_base"]);
      expect(readProgress("tenant-1")).toEqual(["operational_prompt"]);
      expect(readProgress("tenant-2")).toEqual(["knowledge_base"]);
    });

    it("ignores corrupted (non-JSON) stored progress instead of throwing", () => {
      localStorage.setItem("onboarding_guide_progress:tenant-1", "not-json");
      expect(readProgress("tenant-1")).toEqual([]);
    });

    it("filters out unknown step ids from stored progress", () => {
      localStorage.setItem(
        "onboarding_guide_progress:tenant-1",
        JSON.stringify(["operational_prompt", "not_a_real_step"]),
      );
      expect(readProgress("tenant-1")).toEqual(["operational_prompt"]);
    });
  });

  describe("fallback when localStorage is unavailable", () => {
    it("still works via in-memory fallback when localStorage throws", () => {
      const setItemSpy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("SecurityError");
        });
      const getItemSpy = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("SecurityError");
        });

      writeGuideDisabled(true);
      expect(readGuideDisabled()).toBe(true);

      writeProgress("tenant-1", ["operational_prompt"]);
      expect(readProgress("tenant-1")).toEqual(["operational_prompt"]);

      setItemSpy.mockRestore();
      getItemSpy.mockRestore();
    });
  });
});
