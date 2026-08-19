import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { buildInstallationSnippet, useTenantSnippet } from "./useTenantSnippet";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe("buildInstallationSnippet", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("computes the snippet from the tenant id and the public site URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://interasisai.com.br";
    expect(buildInstallationSnippet({ id: "demo-cliente" })).toBe(
      '<script src="https://interasisai.com.br/widget/demo-cliente" async></script>',
    );
  });

  it("produces a different snippet for a different tenant id", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://interasisai.com.br";
    const a = buildInstallationSnippet({ id: "tenant-a" });
    const b = buildInstallationSnippet({ id: "tenant-b" });
    expect(a).not.toBe(b);
  });

  it("strips a trailing slash from the base URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://interasisai.com.br/";
    expect(buildInstallationSnippet({ id: "demo" })).toBe(
      '<script src="https://interasisai.com.br/widget/demo" async></script>',
    );
  });
});

describe("useTenantSnippet", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "https://interasisai.com.br";
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("exposes the computed snippet for the given tenant", () => {
    const { result } = renderHook(() => useTenantSnippet({ id: "demo-cliente" }));
    expect(result.current.snippet).toContain("demo-cliente");
  });

  it("copies the snippet to the clipboard and shows success feedback", async () => {
    const { result } = renderHook(() => useTenantSnippet({ id: "demo-cliente" }));

    await act(async () => {
      await result.current.copySnippet();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(result.current.snippet);
    expect(result.current.copied).toBe(true);
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows an error toast when the clipboard write fails", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
    });
    const { result } = renderHook(() => useTenantSnippet({ id: "demo-cliente" }));

    await act(async () => {
      await result.current.copySnippet();
    });

    expect(result.current.copied).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });
});
