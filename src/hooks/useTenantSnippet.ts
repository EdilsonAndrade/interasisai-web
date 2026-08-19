// ============================================================================
// useTenantSnippet — Hook: computes the ready-to-paste widget installation
// snippet for a tenant and exposes a copy-to-clipboard action.
// See specs/016-embeddable-chat-widget/data-model.md → InstallationSnippet
// ============================================================================

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Tenant } from "@/services";

interface UseTenantSnippetReturn {
  snippet: string;
  copied: boolean;
  copySnippet: () => Promise<void>;
}

function getWidgetBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

export function buildInstallationSnippet(tenant: Pick<Tenant, "id">): string {
  const baseUrl = getWidgetBaseUrl();
  return `<script src="${baseUrl}/widget/${tenant.id}" async></script>`;
}

export function useTenantSnippet(tenant: Pick<Tenant, "id">): UseTenantSnippetReturn {
  const [copied, setCopied] = useState(false);
  const snippet = buildInstallationSnippet(tenant);

  const copySnippet = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Snippet copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o snippet. Copie manualmente.");
    }
  }, [snippet]);

  return { snippet, copied, copySnippet };
}
