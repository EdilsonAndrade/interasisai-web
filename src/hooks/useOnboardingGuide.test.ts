import { act, renderHook } from "@testing-library/react";
import { useOnboardingGuide } from "./useOnboardingGuide";

beforeEach(() => {
  localStorage.clear();
});

describe("useOnboardingGuide", () => {
  it("starts enabled, pointed at a general reminder (no tenant needed), minimized, with no completed steps", () => {
    const { result } = renderHook(() => useOnboardingGuide());

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.activeTenantId).not.toBeNull();
    expect(result.current.completedSteps).toEqual([]);
    expect(result.current.isMinimized).toBe(true);
  });

  it("lets the general reminder checklist be checked off before any tenant exists, and persists it across remounts", () => {
    const { result, unmount } = renderHook(() => useOnboardingGuide());

    act(() => result.current.toggleStepComplete("knowledge_base"));
    expect(result.current.completedSteps).toEqual(["knowledge_base"]);

    unmount();
    const { result: reloaded } = renderHook(() => useOnboardingGuide());
    expect(reloaded.current.completedSteps).toEqual(["knowledge_base"]);
  });

  it("opens the guide for a tenant, loading any previously saved progress", () => {
    localStorage.setItem(
      "onboarding_guide_progress:tenant-1",
      JSON.stringify(["operational_prompt"]),
    );
    const { result } = renderHook(() => useOnboardingGuide());

    act(() => result.current.openGuide("tenant-1"));

    expect(result.current.activeTenantId).toBe("tenant-1");
    expect(result.current.completedSteps).toEqual(["operational_prompt"]);
  });

  it("sets the active tenant without forcing the panel open, loading saved progress", () => {
    localStorage.setItem(
      "onboarding_guide_progress:tenant-1",
      JSON.stringify(["operational_prompt"]),
    );
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.minimizeGuide());

    act(() => result.current.setActiveTenant("tenant-1"));

    expect(result.current.activeTenantId).toBe("tenant-1");
    expect(result.current.completedSteps).toEqual(["operational_prompt"]);
    expect(result.current.isMinimized).toBe(true);
  });

  it("restores the active tenant and minimized state across remounts (e.g. a page refresh)", () => {
    const { result, unmount } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));
    act(() => result.current.minimizeGuide());
    unmount();

    const { result: reloaded } = renderHook(() => useOnboardingGuide());

    expect(reloaded.current.activeTenantId).toBe("tenant-1");
    expect(reloaded.current.isMinimized).toBe(true);
  });

  it("marks a step complete and persists it for the active tenant", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));

    act(() => result.current.toggleStepComplete("identity_guardrail"));

    expect(result.current.completedSteps).toEqual(["identity_guardrail"]);
    expect(
      JSON.parse(localStorage.getItem("onboarding_guide_progress:tenant-1") ?? "[]"),
    ).toEqual(["identity_guardrail"]);
  });

  it("unmarks a step that was already complete when toggled again", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));

    act(() => result.current.toggleStepComplete("identity_guardrail"));
    act(() => result.current.toggleStepComplete("identity_guardrail"));

    expect(result.current.completedSteps).toEqual([]);
    expect(
      JSON.parse(localStorage.getItem("onboarding_guide_progress:tenant-1") ?? "[]"),
    ).toEqual([]);
  });

  it("keeps progress isolated per tenant", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));
    act(() => result.current.toggleStepComplete("operational_prompt"));

    act(() => result.current.openGuide("tenant-2"));
    expect(result.current.completedSteps).toEqual([]);
  });

  it("minimizes the guide without losing the active tenant or progress", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));
    act(() => result.current.toggleStepComplete("operational_prompt"));

    act(() => result.current.minimizeGuide());

    expect(result.current.isMinimized).toBe(true);
    expect(result.current.activeTenantId).toBe("tenant-1");
    expect(result.current.completedSteps).toEqual(["operational_prompt"]);
  });

  it("maximizes the guide back from a minimized state", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));
    act(() => result.current.minimizeGuide());

    act(() => result.current.maximizeGuide());

    expect(result.current.isMinimized).toBe(false);
  });

  it("resets the minimized state when the guide is reopened for a new tenant", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));
    act(() => result.current.minimizeGuide());

    act(() => result.current.openGuide("tenant-2"));

    expect(result.current.isMinimized).toBe(false);
  });

  it("disables the guide, persists the preference, and closes the panel", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));

    act(() => result.current.disableGuide());

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.activeTenantId).toBeNull();
    expect(localStorage.getItem("onboarding_guide_disabled")).toBe("true");
    expect(localStorage.getItem("onboarding_guide_active_tenant")).toBeNull();
  });

  it("does not open the guide while disabled", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.disableGuide());

    act(() => result.current.openGuide("tenant-1"));

    expect(result.current.activeTenantId).toBeNull();
  });

  it("re-enables the guide, allowing it to open again", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.disableGuide());

    act(() => result.current.reEnableGuide());
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.activeTenantId).not.toBeNull();
    expect(localStorage.getItem("onboarding_guide_disabled")).toBeNull();

    act(() => result.current.openGuide("tenant-1"));
    expect(result.current.activeTenantId).toBe("tenant-1");
  });

  it("ignores toggleStepComplete while the guide is disabled", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.disableGuide());

    act(() => result.current.toggleStepComplete("operational_prompt"));

    expect(result.current.completedSteps).toEqual([]);
  });
});
