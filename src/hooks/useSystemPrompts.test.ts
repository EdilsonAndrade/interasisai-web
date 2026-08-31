import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import {
  fetchSystemPrompts,
  rollbackSystemPrompt,
  updateSystemPrompt,
} from "@/services/systemPrompts";
import type { SystemPrompt } from "@/services/systemPrompts.types";
import { useSystemPrompts } from "./useSystemPrompts";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/services/systemPrompts", () => ({
  fetchSystemPrompts: jest.fn(),
  updateSystemPrompt: jest.fn(),
  rollbackSystemPrompt: jest.fn(),
}));

const fetchMock = jest.mocked(fetchSystemPrompts);
const updateMock = jest.mocked(updateSystemPrompt);
const rollbackMock = jest.mocked(rollbackSystemPrompt);

const routingAgent: SystemPrompt = {
  id: "1",
  prompt_key: "routing_agent",
  titulo: "routing_agent",
  current_version: "conteúdo atual",
  last_version: "conteúdo anterior",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const groundedness: SystemPrompt = {
  id: "2",
  prompt_key: "groundedness_rule",
  titulo: "GROUNDEDNESS_RULE",
  current_version: "regra atual",
  last_version: "regra anterior",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("useSystemPrompts — listing (US1)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("loads the prompt list on mount and selects the first prompt", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, data: [routingAgent, groundedness] });

    const { result } = renderHook(() => useSystemPrompts());

    expect(result.current.state).toBe("loading");

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).toBe("success");
    expect(result.current.prompts).toEqual([routingAgent, groundedness]);
    expect(result.current.selectedPromptKey).toBe("routing_agent");
  });

  it("surfaces an error state when the listing fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      message: "Erro interno do servidor. Tente novamente.",
      blockers: [],
      retryable: true,
    });

    const { result } = renderHook(() => useSystemPrompts());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe("Erro interno do servidor. Tente novamente.");
  });
});

describe("useSystemPrompts — savePrompt (US2)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockResolvedValue({ ok: true, status: 200, data: [routingAgent] });
  });

  it("blocks saving an empty/whitespace-only content without calling the API", async () => {
    const { result } = renderHook(() => useSystemPrompts());
    await act(async () => {
      await Promise.resolve();
    });

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.savePrompt("routing_agent", "   ");
    });

    expect(ok).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it("saves the trimmed content and updates the prompt in the list on success", async () => {
    const updated: SystemPrompt = { ...routingAgent, current_version: "novo conteúdo" };
    updateMock.mockResolvedValue({ ok: true, status: 200, data: updated });

    const { result } = renderHook(() => useSystemPrompts());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.savePrompt("routing_agent", "  novo conteúdo  ");
    });

    expect(updateMock).toHaveBeenCalledWith("routing_agent", { conteudo: "novo conteúdo" });
    expect(result.current.prompts[0]).toEqual(updated);
    expect(toast.success).toHaveBeenCalled();
  });

  it("keeps the previous prompt data and surfaces an error on failure", async () => {
    updateMock.mockResolvedValue({
      ok: false,
      status: 400,
      message: "Conteúdo inválido.",
      blockers: [],
      retryable: false,
    });

    const { result } = renderHook(() => useSystemPrompts());
    await act(async () => {
      await Promise.resolve();
    });

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.savePrompt("routing_agent", "algo");
    });

    expect(ok).toBe(false);
    expect(result.current.prompts[0]).toEqual(routingAgent);
    expect(toast.error).toHaveBeenCalledWith("Conteúdo inválido.");
  });
});

describe("useSystemPrompts — rollbackPrompt (US3)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockResolvedValue({ ok: true, status: 200, data: [routingAgent] });
  });

  it("swaps current_version and last_version on a successful rollback", async () => {
    const reverted: SystemPrompt = {
      ...routingAgent,
      current_version: routingAgent.last_version,
      last_version: routingAgent.current_version,
    };
    rollbackMock.mockResolvedValue({ ok: true, status: 200, data: reverted });

    const { result } = renderHook(() => useSystemPrompts());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.rollbackPrompt("routing_agent");
    });

    expect(rollbackMock).toHaveBeenCalledWith("routing_agent");
    expect(result.current.prompts[0]).toEqual(reverted);
    expect(toast.success).toHaveBeenCalled();
  });

  it("applying rollback twice returns to the original content (reversibility)", async () => {
    const reverted: SystemPrompt = {
      ...routingAgent,
      current_version: routingAgent.last_version,
      last_version: routingAgent.current_version,
    };
    rollbackMock
      .mockResolvedValueOnce({ ok: true, status: 200, data: reverted })
      .mockResolvedValueOnce({ ok: true, status: 200, data: routingAgent });

    const { result } = renderHook(() => useSystemPrompts());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.rollbackPrompt("routing_agent");
    });
    await act(async () => {
      await result.current.rollbackPrompt("routing_agent");
    });

    expect(result.current.prompts[0]).toEqual(routingAgent);
  });

  it("does not change the prompt content on failure", async () => {
    rollbackMock.mockResolvedValue({
      ok: false,
      status: 500,
      message: "Erro interno do servidor. Tente novamente.",
      blockers: [],
      retryable: true,
    });

    const { result } = renderHook(() => useSystemPrompts());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.rollbackPrompt("routing_agent");
    });

    expect(result.current.prompts[0]).toEqual(routingAgent);
    expect(toast.error).toHaveBeenCalledWith("Erro interno do servidor. Tente novamente.");
  });
});
