// ============================================================================
// Tests: useAdminIngest — Knowledge base ingestion hook
// ============================================================================

import { act, renderHook } from "@testing-library/react";
import { ingestKnowledge } from "@/services";
import { useAdminIngest } from "./useAdminIngest";

jest.mock("@/services", () => {
  const actual = jest.requireActual("@/services");
  return {
    ...actual,
    ingestKnowledge: jest.fn(),
  };
});

const mockedIngestKnowledge = jest.mocked(ingestKnowledge);

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

// Set required env var for pythonBackend config
const ORIGINAL_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;

describe("useAdminIngest", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test.local";
  });

  afterAll(() => {
    if (ORIGINAL_URL) {
      process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = ORIGINAL_URL;
    } else {
      delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Validation
  // -----------------------------------------------------------------------

  it("returns error when tenantId is empty", async () => {
    const { result } = renderHook(() => useAdminIngest());

    await act(async () => {
      result.current.setTextContent("Some text");
      await result.current.submitIngest();
    });

    expect(result.current.result).toEqual({
      type: "error",
      message: "O Tenant ID é obrigatório.",
    });
    expect(mockedIngestKnowledge).not.toHaveBeenCalled();
  });

  it("returns error when textContent is empty", async () => {
    const { result } = renderHook(() => useAdminIngest());

    act(() => {
      result.current.setTenantId("123");
    });

    await act(async () => {
      await result.current.submitIngest();
    });

    expect(result.current.result).toEqual({
      type: "error",
      message: "O conteúdo do texto é obrigatório.",
    });
    expect(mockedIngestKnowledge).not.toHaveBeenCalled();
  });

  it("returns error when textContent exceeds 100k characters", async () => {
    const { result } = renderHook(() => useAdminIngest());

    act(() => {
      result.current.setTenantId("123");
      result.current.setTextContent("x".repeat(100_001));
    });

    await act(async () => {
      await result.current.submitIngest();
    });

    expect(result.current.result).toEqual({
      type: "error",
      message: "O texto excede o limite máximo de 100.000 caracteres.",
    });
    expect(mockedIngestKnowledge).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Success
  // -----------------------------------------------------------------------

  it("calls ingestKnowledge and shows success on 201", async () => {
    mockedIngestKnowledge.mockResolvedValueOnce({
      ok: true,
      status: 201,
      message: "A tarefa de vetorização foi agendada.",
    });

    const { result } = renderHook(() => useAdminIngest());

    act(() => {
      result.current.setTenantId("987654");
      result.current.setTextContent("Regras de negócio aqui.");
    });

    await act(async () => {
      await result.current.submitIngest();
      await flushPromises();
    });

    expect(mockedIngestKnowledge).toHaveBeenCalledWith(
      { text_content: "Regras de negócio aqui." },
      "987654",
    );

    expect(result.current.result).toEqual({
      type: "success",
      message: "A tarefa de vetorização foi agendada.",
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.textContent).toBe(""); // Cleared on success
    expect(result.current.tenantId).toBe("987654"); // Kept on success
  });

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  it("shows error message on HTTP 400", async () => {
    mockedIngestKnowledge.mockResolvedValueOnce({
      ok: false,
      status: 400,
      message: "text_content não pode estar vazio.",
    });

    const { result } = renderHook(() => useAdminIngest());

    act(() => {
      result.current.setTenantId("123");
      result.current.setTextContent("test");
    });

    await act(async () => {
      await result.current.submitIngest();
      await flushPromises();
    });

    expect(result.current.result).toEqual({
      type: "error",
      message: "text_content não pode estar vazio.",
    });
    expect(result.current.textContent).toBe("test"); // Not cleared on error
  });

  it("shows error message on HTTP 500", async () => {
    mockedIngestKnowledge.mockResolvedValueOnce({
      ok: false,
      status: 500,
      message: "Erro interno do servidor.",
    });

    const { result } = renderHook(() => useAdminIngest());

    act(() => {
      result.current.setTenantId("123");
      result.current.setTextContent("test");
    });

    await act(async () => {
      await result.current.submitIngest();
      await flushPromises();
    });

    expect(result.current.result).toEqual({
      type: "error",
      message: "Erro interno do servidor.",
    });
  });

  it("shows error on network failure", async () => {
    mockedIngestKnowledge.mockResolvedValueOnce({
      ok: false,
      status: 0,
      message: "Não foi possível se conectar ao serviço de mensagens.",
    });

    const { result } = renderHook(() => useAdminIngest());

    act(() => {
      result.current.setTenantId("123");
      result.current.setTextContent("test");
    });

    await act(async () => {
      await result.current.submitIngest();
      await flushPromises();
    });

    expect(result.current.result).toEqual({
      type: "error",
      message: "Não foi possível se conectar ao serviço de mensagens.",
    });
  });

  // -----------------------------------------------------------------------
  // clearResult
  // -----------------------------------------------------------------------

  it("clears result when clearResult is called", async () => {
    mockedIngestKnowledge.mockResolvedValueOnce({
      ok: true,
      status: 201,
      message: "Processando...",
    });

    const { result } = renderHook(() => useAdminIngest());

    act(() => {
      result.current.setTenantId("123");
      result.current.setTextContent("text");
    });

    await act(async () => {
      await result.current.submitIngest();
      await flushPromises();
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.clearResult();
    });

    expect(result.current.result).toBeNull();
  });
});
