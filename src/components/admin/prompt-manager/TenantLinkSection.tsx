// ============================================================================
// TenantLinkSection — Formulário de vínculo tenant-prompt com overlay opcional
// ============================================================================

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Loader2, Search, Shield, Star, X } from "lucide-react";
import { GuardrailScopeBadge } from "@/components/admin/GuardrailScopeBadge";
import { tenantLinkSchema, type TenantLinkFormData } from "@/lib/promptManagerSchemas";
import { missingRequiredPlaceholders } from "@/lib/promptPlaceholders";
import { MarkdownEditorCustom } from "./MarkdownEditorCustom";
import { MissingPlaceholdersAlert } from "./MissingPlaceholdersAlert";
import type { NodeType, Prompt, TenantLinkInput, TenantPromptDetail } from "@/services/promptManager.types";

const NODE_TABS: { id: NodeType; label: string }[] = [
  { id: "operational", label: "Operacional" },
  { id: "institutional", label: "Institucional" },
  { id: "chitchat", label: "Chitchat" },
];

interface TenantLinkSectionProps {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  fetchingDetail: boolean;
  detailError: string | null;
  tenantNotFound: boolean;
  tenantDetail: TenantPromptDetail | null;
  onLink: (input: TenantLinkInput, nodeType: NodeType) => Promise<boolean>;
  onFetchDetail: (tenantId: string, nodeType: NodeType) => Promise<void>;
  onClearDetail: () => void;
}

export function TenantLinkSection({
  prompts,
  loading,
  error,
  submitting,
  fetchingDetail,
  detailError,
  tenantNotFound,
  tenantDetail,
  onLink,
  onFetchDetail,
  onClearDetail,
}: TenantLinkSectionProps) {
  const [selectedNode, setSelectedNode] = useState<NodeType>("operational");
  const nodePrompts = prompts.filter((p) => p.node_type === selectedNode);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TenantLinkFormData>({
    resolver: zodResolver(tenantLinkSchema),
    defaultValues: { tenant_id: "", prompt_id: "", custom_content_override: "" },
  });

  const overrideValue = watch("custom_content_override");

  const [missingTokens, setMissingTokens] = useState<string[] | null>(null);
  const [pendingLinkData, setPendingLinkData] = useState<TenantLinkFormData | null>(null);

  // Pre-fill form when tenant detail is loaded
  useEffect(() => {
    if (tenantDetail) {
      reset({
        tenant_id: tenantDetail.tenant_id,
        prompt_id: tenantDetail.prompt_id,
        custom_content_override: tenantDetail.custom_content_override ?? "",
      });
    }
  }, [tenantDetail, reset]);

  const handleFetchDetail = () => {
    const tenantId = getValues("tenant_id").trim();
    if (!tenantId) return;
    onFetchDetail(tenantId, selectedNode);
  };

  const handleSelectNode = (node: NodeType) => {
    setSelectedNode(node);
    setMissingTokens(null);
    setPendingLinkData(null);
    setValue("prompt_id", "");
    const tenantId = getValues("tenant_id").trim();
    // Se já havia um tenant carregado, atualiza o card para o novo nó sem
    // exigir que o usuário busque novamente.
    if (tenantId && tenantDetail) {
      onFetchDetail(tenantId, node);
    }
  };

  const handleClearDetail = () => {
    onClearDetail();
    reset({ tenant_id: "", prompt_id: "", custom_content_override: "" });
  };

  const submitLink = async (data: TenantLinkFormData) => {
    const input: TenantLinkInput = {
      tenant_id: data.tenant_id,
      prompt_id: data.prompt_id,
    };
    if (data.custom_content_override?.trim()) {
      input.custom_content_override = data.custom_content_override.trim();
    }
    const ok = await onLink(input, selectedNode);
    if (!ok) {
      // Keep tenant_id and prompt_id on error
      reset(
        (prev) => ({
          ...prev,
          tenant_id: data.tenant_id,
          prompt_id: data.prompt_id,
          custom_content_override: data.custom_content_override ?? "",
        }),
        { keepDefaultValues: false },
      );
      return;
    }
    // On success, onLink already refreshed tenantDetail — the effect above
    // re-populates the form from it, so the "Vínculo Atual" card reflects
    // the change immediately without needing another search or page refresh.
  };

  const onFormSubmit = async (data: TenantLinkFormData) => {
    const override = data.custom_content_override?.trim();
    if (override) {
      const missing = missingRequiredPlaceholders(override, selectedNode);
      if (missing.length > 0) {
        setMissingTokens(missing);
        setPendingLinkData(data);
        return;
      }
    }
    await submitLink(data);
  };

  const handleFixMissingPlaceholders = () => {
    setMissingTokens(null);
    setPendingLinkData(null);
  };

  const handleSaveAnyway = async () => {
    setMissingTokens(null);
    if (pendingLinkData) {
      await submitLink(pendingLinkData);
      setPendingLinkData(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-text-weak">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <p className="text-sm">Carregando prompts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-red-500/30 bg-red-500/10 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-text-strong">Vincular Tenant</h2>
      <p className="text-sm text-text-weak">
        Associe um tenant a um prompt específico, com possibilidade de customização de conteúdo.
      </p>

      {/* Seletor de Nó — cada nó tem vínculo ativo independente por tenant */}
      <div
        className="flex gap-0.5 self-start rounded-card border border-border-subtle bg-surface-subtle p-0.5"
        role="group"
        aria-label="Nó de destino"
      >
        {NODE_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSelectNode(id)}
            aria-pressed={selectedNode === id}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedNode === id
                ? "bg-brand-primary text-text-inverse"
                : "text-text-weak hover:text-text-body"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
        {missingTokens && missingTokens.length > 0 && (
          <MissingPlaceholdersAlert
            missingTokens={missingTokens}
            onFix={handleFixMissingPlaceholders}
            onSaveAnyway={handleSaveAnyway}
          />
        )}
        {/* tenant_id + Buscar */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tenant-id" className="text-sm font-semibold text-text-strong">
            ID do Tenant
          </label>
          <div className="flex gap-2">
            <input
              id="tenant-id"
              type="text"
              autoFocus
              {...register("tenant_id")}
              className="flex-1 rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-body outline-none transition-colors focus:border-brand-primary disabled:opacity-60"
              placeholder="ID do tenant"
              disabled={fetchingDetail}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleFetchDetail();
                }
              }}
            />
            <button
              type="button"
              onClick={handleFetchDetail}
              disabled={fetchingDetail}
              className="inline-flex min-h-10 items-center gap-2 rounded-card bg-surface-subtle px-4 py-2 text-sm font-semibold text-text-body transition-colors hover:bg-brand-primary/10 hover:text-brand-primary disabled:opacity-50"
            >
              {fetchingDetail ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              Buscar
            </button>
          </div>
          {errors.tenant_id && (
            <p role="alert" className="text-xs font-semibold text-red-400">
              {errors.tenant_id.message}
            </p>
          )}
        </div>

        {/* Tenant sem vínculo ainda — estado esperado, não bloqueia o formulário */}
        {tenantNotFound && !tenantDetail && (
          <div className="rounded-card border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Nenhum prompt vinculado a este tenant ainda. Selecione um prompt abaixo para criar o primeiro vínculo.
          </div>
        )}

        {/* Falha real ao buscar o vínculo (rede/servidor) — não bloqueia, permite tentar de novo */}
        {detailError && (
          <div className="flex items-center justify-between gap-3 rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <span>{detailError}</span>
            <button
              type="button"
              onClick={handleFetchDetail}
              className="shrink-0 font-semibold underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Tenant Detail Card (when found) */}
        {tenantDetail && (
          <div className="rounded-card border border-brand-primary/30 bg-surface-base/80 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-strong">
                Vínculo Atual
              </h3>
              <button
                type="button"
                onClick={handleClearDetail}
                className="rounded-md p-1 text-text-weak transition-colors hover:bg-surface-subtle hover:text-text-body"
                aria-label="Limpar detalhes"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-text-weak">Prompt: </span>
                <span className="font-semibold text-text-body">
                  {tenantDetail.prompt_titulo}
                  {tenantDetail.is_default_prompt && (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-brand-primary/20 px-1.5 py-0.5 text-xs font-semibold text-brand-primary">
                      <Star className="h-3 w-3" aria-hidden="true" />
                      Padrão
                    </span>
                  )}
                </span>
              </div>
              {tenantDetail.custom_content_override && (
                <div>
                  <span className="text-text-weak">Possui customização de conteúdo</span>
                </div>
              )}
              {!tenantDetail.custom_content_override && (
                <div>
                  <span className="text-text-weak">Sem customização (usa conteúdo base do prompt)</span>
                </div>
              )}
              <div>
                <span className="text-text-weak">Status: </span>
                <span className={`font-semibold ${tenantDetail.is_active ? "text-emerald-400" : "text-red-400"}`}>
                  {tenantDetail.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>

            {/* Guardrails Associados */}
            {tenantDetail.guardrails_associados.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold text-text-weak">
                  Guardrails Vinculados ({tenantDetail.guardrails_associados.length})
                </p>
                <div className="flex flex-col gap-1">
                  {tenantDetail.guardrails_associados.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-2 rounded-md bg-surface-subtle px-3 py-1.5 text-xs"
                    >
                      <Shield className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                      <span className="font-medium text-text-body">{g.titulo}</span>
                      <GuardrailScopeBadge isGlobal={g.is_global} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* prompt_id (select) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prompt-id" className="text-sm font-semibold text-text-strong">
            Prompt
          </label>
          {nodePrompts.length === 0 ? (
            <div className="rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-sm text-text-weak italic">
              Nenhum prompt cadastrado para este nó. Cadastre um prompt com o nó correspondente primeiro.
            </div>
          ) : (
            <select
              id="prompt-id"
              {...register("prompt_id")}
              className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-body outline-none transition-colors focus:border-brand-primary disabled:opacity-60"
            >
              <option value="">Selecione um prompt...</option>
              {nodePrompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                  {p.is_default ? " (Padrão)" : ""}
                </option>
              ))}
            </select>
          )}
          {errors.prompt_id && (
            <p role="alert" className="text-xs font-semibold text-red-400">
              {errors.prompt_id.message}
            </p>
          )}
        </div>

        {/* custom_content_override (Markdown, optional) */}
        <div className="flex flex-col gap-1.5">
          <MarkdownEditorCustom
            value={overrideValue ?? ""}
            onChange={(v) => setValue("custom_content_override", v)}
            label="Customização de Conteúdo (opcional)"
          />
          <p className="text-xs text-text-weak">
            Se preenchido, este conteúdo substituirá o conteúdo padrão do prompt para este tenant.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
          <button
            type="submit"
            disabled={submitting || nodePrompts.length === 0}
            className="inline-flex min-h-10 items-center gap-2 rounded-card bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Link className="h-4 w-4" aria-hidden="true" />
            )}
            {submitting ? "Vinculando..." : "Vincular Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}
