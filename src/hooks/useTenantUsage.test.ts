import { renderHook, waitFor } from "@testing-library/react";
import { getTenantUsage } from "@/services/pythonBackend";
import { useTenantUsage } from "./useTenantUsage";

jest.mock("@/services/pythonBackend", () => ({
  getTenantUsage: jest.fn(),
}));

const getTenantUsageMock = jest.mocked(getTenantUsage);

describe("useTenantUsage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches usage on mount and exposes the result", async () => {
    const usage = {
      tenant_id: "tenant-1",
      monthly_message_limit: 500,
      current_month_calls: 156,
      percentage_used: 31.2,
      blocked: false,
    };
    getTenantUsageMock.mockResolvedValueOnce({ ok: true, status: 200, data: usage });

    const { result } = renderHook(() => useTenantUsage("tenant-1"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.usage).toEqual(usage);
    expect(result.current.error).toBeNull();
  });

  it("stores the error message and clears usage on failure, without throwing", async () => {
    getTenantUsageMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      message: "Tenant não encontrado",
      retryable: false,
    });

    const { result } = renderHook(() => useTenantUsage("missing"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.usage).toBeNull();
    expect(result.current.error).toBe("Tenant não encontrado");
  });

  it("skips fetching when tenantId is null", () => {
    const { result } = renderHook(() => useTenantUsage(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.usage).toBeNull();
    expect(getTenantUsageMock).not.toHaveBeenCalled();
  });

  it("refetches when tenantId changes", async () => {
    getTenantUsageMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          tenant_id: "tenant-1",
          monthly_message_limit: null,
          current_month_calls: 0,
          percentage_used: null,
          blocked: false,
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          tenant_id: "tenant-2",
          monthly_message_limit: 100,
          current_month_calls: 50,
          percentage_used: 50,
          blocked: false,
        },
      });

    const { result, rerender } = renderHook(({ id }) => useTenantUsage(id), {
      initialProps: { id: "tenant-1" },
    });

    await waitFor(() => expect(result.current.usage?.tenant_id).toBe("tenant-1"));

    rerender({ id: "tenant-2" });

    await waitFor(() => expect(result.current.usage?.tenant_id).toBe("tenant-2"));
    expect(getTenantUsageMock).toHaveBeenCalledTimes(2);
  });

  it("allows manual refetch via refetch()", async () => {
    getTenantUsageMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        tenant_id: "tenant-1",
        monthly_message_limit: 500,
        current_month_calls: 100,
        percentage_used: 20,
        blocked: false,
      },
    });

    const { result } = renderHook(() => useTenantUsage("tenant-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.refetch();

    expect(getTenantUsageMock).toHaveBeenCalledTimes(2);
  });
});
