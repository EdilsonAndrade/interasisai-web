import { act, renderHook } from "@testing-library/react";
import { fetchPromptTenants } from "@/services/promptManager";
import { usePromptTenants } from "./usePromptTenants";

jest.mock("@/services/promptManager", () => ({
  fetchPromptTenants: jest.fn(),
}));

const fetchMock = jest.mocked(fetchPromptTenants);

describe("usePromptTenants", () => {
  beforeEach(() => jest.clearAllMocks());

  it("loads the tenants linked to a prompt", async () => {
    const tenants = [{ id: "acme", name: "Acme Ltda" }];
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { prompt_id: "prompt-1", node_type: "operational", tenants },
    });
    const { result } = renderHook(() => usePromptTenants());

    await act(async () => {
      await result.current.fetchTenants("prompt-1");
    });

    expect(fetchMock).toHaveBeenCalledWith("prompt-1");
    expect(result.current.tenants).toEqual(tenants);
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error and clears tenants on failure", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      code: "PROMPT_NOT_FOUND",
      message: "Prompt não encontrado.",
      blockers: [],
      retryable: false,
    });
    const { result } = renderHook(() => usePromptTenants());

    await act(async () => {
      await result.current.fetchTenants("prompt-missing");
    });

    expect(result.current.tenants).toEqual([]);
    expect(result.current.error).toBe("Prompt não encontrado.");
  });
});
