import { act, renderHook } from "@testing-library/react";
import { useOnboardingGuide } from "./useOnboardingGuide";

beforeEach(() => {
  localStorage.clear();
});

describe("useOnboardingGuide", () => {
  it("starts enabled, with no active tenant, no completed steps, and not minimized", () => {
    const { result } = renderHook(() => useOnboardingGuide());

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.activeTenantId).toBeNull();
    expect(result.current.completedSteps).toEqual([]);
    expect(result.current.isMinimized).toBe(false);
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

  it("closes the guide without erasing the saved progress", () => {
    const { result } = renderHook(() => useOnboardingGuide());
    act(() => result.current.openGuide("tenant-1"));
    act(() => result.current.toggleStepComplete("operational_prompt"));

    act(() => result.current.closeGuide());
    expect(result.current.activeTenantId).toBeNull();

    act(() => result.current.openGuide("tenant-1"));
    expect(result.current.completedSteps).toEqual(["operational_prompt"]);
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
    expect(localStorage.getItem("onboarding_guide_disabled")).toBeNull();

    act(() => result.current.openGuide("tenant-1"));
    expect(result.current.activeTenantId).toBe("tenant-1");
  });

  it("ignores toggleStepComplete when no tenant is active", () => {
    const { result } = renderHook(() => useOnboardingGuide());

    act(() => result.current.toggleStepComplete("operational_prompt"));

    expect(result.current.completedSteps).toEqual([]);
  });
});
