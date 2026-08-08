import { act, renderHook } from "@testing-library/react";
import { useAdminAuth } from "./useAdminAuth";

const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("useAdminAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("submits credentials and refreshes after success", async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 204,
    } as Response);
    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.login({ user: "admin", password: "secret" });
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: "admin", password: "secret" }),
    });
    expect(refresh).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("shows a generic error after rejected credentials", async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);
    const { result } = renderHook(() => useAdminAuth());

    await act(async () => {
      await result.current.login({ user: "admin", password: "wrong" });
    });

    expect(result.current.error).toBe("Usuário ou senha inválidos.");
  });
});