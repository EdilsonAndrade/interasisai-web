"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useKnowledgeBaseItems } from "@/hooks/useKnowledgeBaseItems";
import { KnowledgeBaseDeleteDialog } from "@/components/admin/KnowledgeBaseDeleteDialog";
import { DeleteAction } from "@/components/admin/DeleteAction";
import { ConfirmActionDialog } from "@/components/admin/knowledgeBaseItems/ConfirmActionDialog";
import { KnowledgeBaseUploadForm } from "@/components/admin/knowledgeBaseItems/KnowledgeBaseUploadForm";
import { KnowledgeBaseDuplicateDialog } from "@/components/admin/knowledgeBaseItems/KnowledgeBaseDuplicateDialog";
import { KnowledgeBaseItemsGrid } from "@/components/admin/knowledgeBaseItems/KnowledgeBaseItemsGrid";
import { KnowledgeBaseItemDetailModal } from "@/components/admin/knowledgeBaseItems/KnowledgeBaseItemDetailModal";
import type { KnowledgeBaseUploadMode } from "@/services/pythonBackend.types";

const MAX_LENGTH = 100_000;

type KnowledgeBaseEditorProps = {
  tenantId: string;
};

type PendingUpload = {
  files: File[];
  texts: string[];
  mode: KnowledgeBaseUploadMode;
};

type PendingReplaceFile = {
  itemId: string;
  file: File;
};

export function KnowledgeBaseEditor({ tenantId }: KnowledgeBaseEditorProps) {
  const { content, loading, saving, deleting, error, fieldErrors, save, remove, refresh } =
    useKnowledgeBase(tenantId);
  const itemsHook = useKnowledgeBaseItems(tenantId);
  const [draft, setDraft] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [pendingReplaceFile, setPendingReplaceFile] = useState<PendingReplaceFile | null>(null);

  // Sync the editable draft whenever the loaded content for this tenant changes.
  useEffect(() => {
    setDraft(content ?? "");
    setValidationError(null);
  }, [tenantId, content]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed) {
      setValidationError("O conteúdo da base de conhecimento é obrigatório.");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setValidationError(
        `O texto excede o limite máximo de ${MAX_LENGTH.toLocaleString()} caracteres.`,
      );
      return;
    }
    setValidationError(null);

    const ok = await save(trimmed);
    if (ok) {
      toast.success(
        "Base de conhecimento salva com sucesso. A atualização do comportamento da IA pode levar alguns minutos.",
      );
    }
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (itemsHook.error) toast.error(itemsHook.error);
  }, [itemsHook.error]);

  useEffect(() => {
    if (itemsHook.uploadError) toast.error(itemsHook.uploadError);
  }, [itemsHook.uploadError]);

  const handleDeleteConfirm = async () => {
    const ok = await remove();
    if (ok) {
      setDeleteDialogOpen(false);
      toast.success("Base de conhecimento excluída com sucesso");
    }
    // On failure the dialog stays open and `error` (toasted above) explains why.
  };

  // ---------------------------------------------------------------------
  // Upload (múltiplos arquivos/texto) — US1/US2
  // ---------------------------------------------------------------------

  const confirmUpload = async () => {
    if (!pendingUpload) return;
    const ok = await itemsHook.uploadItems(pendingUpload);
    setPendingUpload(null);
    if (ok) {
      toast.success("Ingestão atualizada com sucesso.");
      await refresh();
    }
    // On a 409 conflict, itemsHook.conflicts is now set and the duplicate
    // dialog opens automatically; other failures are toasted via uploadError.
  };

  const confirmResolveDuplicates = async (
    resolutions: Parameters<typeof itemsHook.resolveDuplicatesAndRetry>[0],
  ) => {
    const ok = await itemsHook.resolveDuplicatesAndRetry(resolutions);
    if (ok) {
      toast.success("Ingestão atualizada com sucesso.");
      await refresh();
    }
  };

  // ---------------------------------------------------------------------
  // Item detail / substituir arquivo / excluir / editar — US3/US4
  // ---------------------------------------------------------------------

  const openItemDetail = (itemId: string) => {
    setSelectedItemId(itemId);
    itemsHook.getItemDetail(itemId);
  };

  const closeItemDetail = () => {
    setSelectedItemId(null);
    itemsHook.clearSelectedItem();
  };

  const handleSaveItemContent = async (itemContent: string) => {
    if (!selectedItemId) return;
    const ok = await itemsHook.updateItemContent(selectedItemId, itemContent);
    if (ok) {
      toast.success("Conteúdo do item salvo com sucesso.");
      await refresh();
    }
  };

  const confirmReplaceItemFile = async () => {
    if (!pendingReplaceFile) return;
    const ok = await itemsHook.replaceItemFile(pendingReplaceFile.itemId, pendingReplaceFile.file);
    setPendingReplaceFile(null);
    if (ok) {
      toast.success("Arquivo do item substituído com sucesso.");
      await refresh();
    }
  };

  const confirmDeleteItem = async () => {
    if (!pendingDeleteItemId) return;
    const ok = await itemsHook.deleteItem(pendingDeleteItemId);
    if (ok) {
      setPendingDeleteItemId(null);
      closeItemDetail();
      toast.success("Item excluído com sucesso.");
      await refresh();
    } else {
      setPendingDeleteItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-base/60 p-4 text-text-body">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Carregando base de conhecimento...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8"
      >
        <div className="space-y-2">
          <label htmlFor="knowledge-base-content" className="block text-sm font-medium text-text-body">
            Base de Conhecimento
          </label>
          {content === null && !draft && (
            <p className="text-sm text-text-body/70">
              Nenhuma base de conhecimento cadastrada para este tenant.
            </p>
          )}
          <textarea
            id="knowledge-base-content"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setValidationError(null);
            }}
            placeholder="Cole aqui o texto institucional do cliente, regras de negócio, horários de funcionamento, preços, etc..."
            rows={10}
            maxLength={MAX_LENGTH}
            disabled={saving}
            className="w-full resize-y rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong placeholder:text-text-body/50 focus:border-brand-primary/50 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-right text-xs text-text-body/60">
            {draft.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} caracteres
          </p>
          {(validationError || fieldErrors?.content) && (
            <p role="alert" className="text-sm text-red-300">
              {validationError ?? fieldErrors?.content}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-card bg-brand-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Salvando...
              </>
            ) : (
              "Salvar Base de Conhecimento"
            )}
          </button>

          {content !== null && (
            <div className="flex items-center justify-center sm:justify-start">
              <DeleteAction onClick={() => setDeleteDialogOpen(true)} disabled={saving} />
            </div>
          )}
        </div>

        <KnowledgeBaseDeleteDialog
          open={deleteDialogOpen}
          tenantId={tenantId}
          isLoading={deleting}
          onCancel={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </form>

      <section className="space-y-4 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8">
        <h3 className="text-lg font-semibold text-text-strong">Enviar arquivos ou texto</h3>
        <KnowledgeBaseUploadForm
          submitting={itemsHook.uploading}
          onSubmit={(input) => setPendingUpload(input)}
        />
      </section>

      <section className="space-y-4 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8">
        <h3 className="text-lg font-semibold text-text-strong">Itens desta ingestão</h3>
        <KnowledgeBaseItemsGrid items={itemsHook.items} onSelectItem={openItemDetail} />
      </section>

      <ConfirmActionDialog
        open={pendingUpload !== null}
        title={
          pendingUpload?.mode === "replace"
            ? "Substituir todos os dados de ingestão?"
            : "Adicionar à ingestão existente?"
        }
        message={
          pendingUpload?.mode === "replace"
            ? "Todos os itens já enviados serão apagados e substituídos pelos novos arquivos/texto."
            : "Os novos arquivos/texto serão somados ao conteúdo já existente."
        }
        confirmLabel={pendingUpload?.mode === "replace" ? "Substituir" : "Adicionar"}
        confirmingLabel="Enviando..."
        isLoading={itemsHook.uploading}
        onCancel={() => setPendingUpload(null)}
        onConfirm={confirmUpload}
      />

      <KnowledgeBaseDuplicateDialog
        open={itemsHook.conflicts !== null}
        conflicts={itemsHook.conflicts ?? []}
        isLoading={itemsHook.uploading}
        onCancel={itemsHook.clearConflicts}
        onSubmit={confirmResolveDuplicates}
      />

      <KnowledgeBaseItemDetailModal
        open={selectedItemId !== null}
        item={itemsHook.selectedItem}
        loading={itemsHook.detailLoading}
        saving={itemsHook.savingContent}
        replacingFile={itemsHook.replacingFile}
        error={itemsHook.detailError}
        onClose={closeItemDetail}
        onSaveContent={handleSaveItemContent}
        onRequestReplaceFile={(file) => {
          if (selectedItemId) setPendingReplaceFile({ itemId: selectedItemId, file });
        }}
        onRequestDelete={() => {
          if (selectedItemId) setPendingDeleteItemId(selectedItemId);
        }}
      />

      <ConfirmActionDialog
        open={pendingReplaceFile !== null}
        title="Substituir arquivo deste item?"
        message="O conteúdo atual deste item será substituído pelo novo arquivo enviado."
        confirmLabel="Substituir"
        confirmingLabel="Substituindo..."
        isLoading={itemsHook.replacingFile}
        onCancel={() => setPendingReplaceFile(null)}
        onConfirm={confirmReplaceItemFile}
      />

      <ConfirmActionDialog
        open={pendingDeleteItemId !== null}
        title="Excluir este item?"
        message="Esta ação não poderá ser desfeita. Os demais itens da ingestão não serão afetados."
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isLoading={itemsHook.deletingItem}
        onCancel={() => setPendingDeleteItemId(null)}
        onConfirm={confirmDeleteItem}
      />
    </div>
  );
}
