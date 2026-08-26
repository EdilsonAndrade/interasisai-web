import { act, renderHook, waitFor } from "@testing-library/react";
import {
  createGlobalRecipient,
  deleteGlobalRecipient,
  listGlobalRecipients,
  updateGlobalRecipient,
} from "@/services/pythonBackend";
import { useGlobalRecipientsManager } from "./useGlobalRecipientsManager";

jest.mock("@/services/pythonBackend", () => ({
  createGlobalRecipient: jest.fn(),
  deleteGlobalRecipient: jest.fn(),
  listGlobalRecipients: jest.fn(),
  updateGlobalRecipient: jest.fn(),
}));

const listMock = jest.mocked(listGlobalRecipients);
const createMock = jest.mocked(createGlobalRecipient);
const updateMock = jest.mocked(updateGlobalRecipient);
const deleteMock = jest.mocked(deleteGlobalRecipient);

const recipientA = { id: 1, email: "a@interasisai.com.br", active: true, created_at: "2026-08-25T10:00:00Z" };
const recipientB = { id: 2, email: "b@interasisai.com.br", active: true, created_at: "2026-08-25T10:00:00Z" };

describe("useGlobalRecipientsManager", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches recipients on mount", async () => {
    listMock.mockResolvedValueOnce({ ok: true, status: 200, items: [recipientA, recipientB] });

    const { result } = renderHook(() => useGlobalRecipientsManager());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.recipients).toEqual([recipientA, recipientB]);
  });

  it("sets error when the initial list fetch fails", async () => {
    listMock.mockResolvedValueOnce({
      ok: false,
      status: 0,
      message: "Não foi possível conectar ao servidor.",
      retryable: true,
    });

    const { result } = renderHook(() => useGlobalRecipientsManager());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Não foi possível conectar ao servidor.");
    expect(result.current.recipients).toEqual([]);
  });

  it("creates a recipient and appends it to the list", async () => {
    listMock.mockResolvedValueOnce({ ok: true, status: 200, items: [recipientA] });
    createMock.mockResolvedValueOnce({ ok: true, status: 201, recipient: recipientB });

    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.create("b@interasisai.com.br");
    });

    expect(result.current.recipients).toEqual([recipientA, recipientB]);
  });

  it("throws on duplicate email (409) without mutating the list", async () => {
    listMock.mockResolvedValueOnce({ ok: true, status: 200, items: [recipientA] });
    createMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      code: "EMAIL_ALREADY_EXISTS",
      message: "E-mail já cadastrado.",
      retryable: false,
    });

    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.create("a@interasisai.com.br");
      }),
    ).rejects.toEqual(expect.objectContaining({ code: "EMAIL_ALREADY_EXISTS" }));

    expect(result.current.recipients).toEqual([recipientA]);
  });

  it("toggles active without removing the recipient", async () => {
    listMock.mockResolvedValueOnce({ ok: true, status: 200, items: [recipientA] });
    updateMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      recipient: { ...recipientA, active: false },
    });

    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.update(1, false);
    });

    expect(result.current.recipients).toEqual([{ ...recipientA, active: false }]);
  });

  it("removes a recipient from the list on delete", async () => {
    listMock.mockResolvedValueOnce({ ok: true, status: 200, items: [recipientA, recipientB] });
    deleteMock.mockResolvedValueOnce({ ok: true, status: 200 });

    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.remove(1);
    });

    expect(result.current.recipients).toEqual([recipientB]);
  });

  it("throws on 404 delete without mutating the list", async () => {
    listMock.mockResolvedValueOnce({ ok: true, status: 200, items: [recipientA] });
    deleteMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      message: "Destinatário não encontrado.",
      retryable: false,
    });

    const { result } = renderHook(() => useGlobalRecipientsManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.remove(999);
      }),
    ).rejects.toEqual(expect.objectContaining({ status: 404 }));

    expect(result.current.recipients).toEqual([recipientA]);
  });
});
