import { act, renderHook, waitFor } from "@testing-library/react";
import {
  deleteKnowledgeBaseItem,
  getKnowledgeBaseItem,
  listKnowledgeBaseItems,
  replaceKnowledgeBaseItemFile,
  updateKnowledgeBaseItemContent,
  uploadKnowledgeBaseItems,
} from "@/services/pythonBackend";
import { useKnowledgeBaseItems } from "./useKnowledgeBaseItems";

jest.mock("@/services/pythonBackend", () => ({
  listKnowledgeBaseItems: jest.fn(),
  getKnowledgeBaseItem: jest.fn(),
  uploadKnowledgeBaseItems: jest.fn(),
  updateKnowledgeBaseItemContent: jest.fn(),
  replaceKnowledgeBaseItemFile: jest.fn(),
  deleteKnowledgeBaseItem: jest.fn(),
}));

const listMock = jest.mocked(listKnowledgeBaseItems);
const getDetailMock = jest.mocked(getKnowledgeBaseItem);
const uploadMock = jest.mocked(uploadKnowledgeBaseItems);
const updateContentMock = jest.mocked(updateKnowledgeBaseItemContent);
const replaceFileMock = jest.mocked(replaceKnowledgeBaseItemFile);
const deleteItemMock = jest.mocked(deleteKnowledgeBaseItem);

const item1 = {
  id: "item-1",
  tenant_id: "1234",
  source_type: "file" as const,
  filename: "precos.xlsx",
  content_preview: "prévia 1",
  content_length: 100,
  created_at: "2026-09-01T12:00:00Z",
  updated_at: "2026-09-01T12:00:00Z",
};
const item2 = {
  id: "item-2",
  tenant_id: "1234",
  source_type: "texto" as const,
  filename: null,
  content_preview: "prévia 2",
  content_length: 50,
  created_at: "2026-09-01T12:00:00Z",
  updated_at: "2026-09-01T12:00:00Z",
};

describe("useKnowledgeBaseItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listMock.mockResolvedValue({ ok: true, status: 200, data: [item1, item2] });
  });

  it("loads the item list on mount", async () => {
    const { result } = renderHook(() => useKnowledgeBaseItems("1234"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listMock).toHaveBeenCalledWith("1234");
    expect(result.current.items).toEqual([item1, item2]);
  });

  it("surfaces a load failure", async () => {
    listMock.mockResolvedValue({ ok: false, status: 500, message: "Erro no servidor.", retryable: true });

    const { result } = renderHook(() => useKnowledgeBaseItems("1234"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Erro no servidor.");
  });

  describe("uploadItems", () => {
    it("sends the given mode/files/texts and refreshes the list on success", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      uploadMock.mockResolvedValue({
        ok: true,
        status: 201,
        data: { created: [{ id: "item-3", filename: "novo.csv", source_type: "file" }], replaced: [] },
      });
      listMock.mockResolvedValue({ ok: true, status: 200, data: [item1, item2] });

      let ok = false;
      await act(async () => {
        ok = await result.current.uploadItems({ mode: "append", texts: ["texto colado"] });
      });

      expect(uploadMock).toHaveBeenCalledWith("1234", { mode: "append", texts: ["texto colado"] });
      expect(ok).toBe(true);
      expect(listMock).toHaveBeenCalledTimes(2); // initial + post-upload refresh
    });

    it("exposes conflicts on a 409 without touching the item list", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      uploadMock.mockResolvedValue({
        ok: false,
        status: 409,
        message: "Alguns arquivos já existem.",
        conflicts: [{ filename: "precos.xlsx", existing_item_id: "item-1" }],
      });

      let ok = true;
      await act(async () => {
        ok = await result.current.uploadItems({ mode: "append", files: [] });
      });

      expect(ok).toBe(false);
      expect(result.current.conflicts).toEqual([
        { filename: "precos.xlsx", existing_item_id: "item-1" },
      ]);
      expect(listMock).toHaveBeenCalledTimes(1); // no refresh on conflict
    });

    it("surfaces a non-409 failure as uploadError", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      uploadMock.mockResolvedValue({
        ok: false,
        status: 422,
        message: "Envie ao menos um arquivo ou texto.",
        retryable: false,
      });

      await act(async () => {
        await result.current.uploadItems({ mode: "replace" });
      });

      expect(result.current.uploadError).toBe("Envie ao menos um arquivo ou texto.");
    });
  });

  describe("resolveDuplicatesAndRetry", () => {
    it("resends the last upload with duplicate_resolutions and refreshes on success", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      uploadMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        message: "conflito",
        conflicts: [{ filename: "precos.xlsx", existing_item_id: "item-1" }],
      });
      await act(async () => {
        await result.current.uploadItems({ mode: "append", texts: ["texto"] });
      });

      uploadMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        data: { created: [], replaced: [{ id: "item-1", filename: "precos.xlsx", source_type: "file" }] },
      });

      let ok = false;
      await act(async () => {
        ok = await result.current.resolveDuplicatesAndRetry([
          { filename: "precos.xlsx", action: "replace", existing_item_id: "item-1" },
        ]);
      });

      expect(uploadMock).toHaveBeenLastCalledWith("1234", {
        mode: "append",
        texts: ["texto"],
        duplicateResolutions: [{ filename: "precos.xlsx", action: "replace", existing_item_id: "item-1" }],
      });
      expect(ok).toBe(true);
      expect(result.current.conflicts).toBeNull();
    });
  });

  describe("getItemDetail", () => {
    it("loads the full content for the given item", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      const detail = { ...item1, content: "conteúdo completo" };
      getDetailMock.mockResolvedValue({ ok: true, status: 200, data: detail });

      await act(async () => {
        await result.current.getItemDetail("item-1");
      });

      expect(getDetailMock).toHaveBeenCalledWith("1234", "item-1");
      expect(result.current.selectedItem).toEqual(detail);
    });
  });

  describe("replaceItemFile", () => {
    it("updates only the affected item, leaving others untouched", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.items).toHaveLength(2));

      const updatedDetail = {
        ...item1,
        filename: "precos-v2.xlsx",
        content: "novo conteúdo",
      };
      replaceFileMock.mockResolvedValue({ ok: true, status: 200, data: updatedDetail });
      const file = new File(["x"], "precos-v2.xlsx");

      let ok = false;
      await act(async () => {
        ok = await result.current.replaceItemFile("item-1", file);
      });

      expect(replaceFileMock).toHaveBeenCalledWith("1234", "item-1", file);
      expect(ok).toBe(true);
      expect(result.current.items.find((i) => i.id === "item-1")?.filename).toBe("precos-v2.xlsx");
      expect(result.current.items.find((i) => i.id === "item-2")).toEqual(item2);
    });
  });

  describe("deleteItem", () => {
    it("removes only the deleted item from state", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.items).toHaveLength(2));

      deleteItemMock.mockResolvedValue({ ok: true, status: 204 });

      let ok = false;
      await act(async () => {
        ok = await result.current.deleteItem("item-1");
      });

      expect(deleteItemMock).toHaveBeenCalledWith("1234", "item-1");
      expect(ok).toBe(true);
      expect(result.current.items).toEqual([item2]);
    });

    it("keeps items unchanged and surfaces detailError on failure", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.items).toHaveLength(2));

      deleteItemMock.mockResolvedValue({ ok: false, status: 404, message: "Item não encontrado.", retryable: false });

      let ok = true;
      await act(async () => {
        ok = await result.current.deleteItem("item-1");
      });

      expect(ok).toBe(false);
      expect(result.current.items).toHaveLength(2);
      expect(result.current.detailError).toBe("Item não encontrado.");
    });
  });

  describe("updateItemContent", () => {
    it("saves edited content and updates the item preview in the list", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.items).toHaveLength(2));

      const detail = { ...item1, content: "texto editado" };
      updateContentMock.mockResolvedValue({ ok: true, status: 200, data: detail });

      let ok = false;
      await act(async () => {
        ok = await result.current.updateItemContent("item-1", "texto editado");
      });

      expect(updateContentMock).toHaveBeenCalledWith("1234", "item-1", "texto editado");
      expect(ok).toBe(true);
      expect(result.current.selectedItem).toEqual(detail);
      expect(result.current.items.find((i) => i.id === "item-1")?.content_preview).toBe("texto editado");
    });

    it("surfaces detailError on failure", async () => {
      const { result } = renderHook(() => useKnowledgeBaseItems("1234"));
      await waitFor(() => expect(result.current.items).toHaveLength(2));

      updateContentMock.mockResolvedValue({
        ok: false,
        status: 422,
        message: "content não pode estar vazio",
        retryable: false,
      });

      let ok = true;
      await act(async () => {
        ok = await result.current.updateItemContent("item-1", "");
      });

      expect(ok).toBe(false);
      expect(result.current.detailError).toBe("content não pode estar vazio");
    });
  });
});
