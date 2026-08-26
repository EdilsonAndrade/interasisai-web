import { renderHook, waitFor } from "@testing-library/react";
import { getMessageLimitConfig } from "@/services/pythonBackend";
import { useMessageLimitConfig } from "./useMessageLimitConfig";

jest.mock("@/services/pythonBackend", () => ({
  getMessageLimitConfig: jest.fn(),
}));

const getMessageLimitConfigMock = jest.mocked(getMessageLimitConfig);

describe("useMessageLimitConfig", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches the config on mount", async () => {
    getMessageLimitConfigMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { worst_case_calls_per_message: 3, average_calls_per_message: 3.5 },
    });

    const { result } = renderHook(() => useMessageLimitConfig());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual({
      worst_case_calls_per_message: 3,
      average_calls_per_message: 3.5,
    });
    expect(result.current.error).toBeNull();
  });

  it("falls back to conservative defaults on network error", async () => {
    getMessageLimitConfigMock.mockResolvedValueOnce({
      ok: false,
      status: 0,
      message: "Não foi possível conectar ao servidor.",
      retryable: true,
    });

    const { result } = renderHook(() => useMessageLimitConfig());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual({
      worst_case_calls_per_message: 3,
      average_calls_per_message: 3,
    });
    expect(result.current.error).toBe("Não foi possível conectar ao servidor.");
  });
});
