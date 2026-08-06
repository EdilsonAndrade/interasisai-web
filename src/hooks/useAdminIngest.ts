// ============================================================================
// useAdminIngest — Hook for knowledge base ingestion admin panel
// ============================================================================

import { useState, useRef, useCallback, useEffect } from "react";
import { ingestKnowledge, type IngestResult } from "@/services";

type UseAdminIngestState = {
  tenantId: string;
  textContent: string;
  isLoading: boolean;
  result: { type: "success" | "error"; message: string } | null;
};

type UseAdminIngestReturn = UseAdminIngestState & {
  setTenantId: (value: string) => void;
  setTextContent: (value: string) => void;
  submitIngest: () => Promise<void>;
  clearResult: () => void;
};

export function useAdminIngest(): UseAdminIngestReturn {
  const [tenantId, setTenantId] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UseAdminIngestState["result"]>(null);

  // Refs to always have latest values in submitIngest callback
  const tenantIdRef = useRef(tenantId);
  const textContentRef = useRef(textContent);

  // Sync refs with state (avoids ref-during-render lint error)
  useEffect(() => {
    tenantIdRef.current = tenantId;
  }, [tenantId]);

  useEffect(() => {
    textContentRef.current = textContent;
  }, [textContent]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const submitIngest = useCallback(async () => {
    const currentTenant = tenantIdRef.current.trim();
    const currentText = textContentRef.current.trim();

    // Validation
    if (!currentTenant) {
      setResult({
        type: "error",
        message: "O Tenant ID é obrigatório.",
      });
      return;
    }

    if (!currentText) {
      setResult({
        type: "error",
        message: "O conteúdo do texto é obrigatório.",
      });
      return;
    }

    if (currentText.length > 100_000) {
      setResult({
        type: "error",
        message: "O texto excede o limite máximo de 100.000 caracteres.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    const response: IngestResult = await ingestKnowledge(
      { text_content: currentText },
      currentTenant,
    );

    setIsLoading(false);

    if (response.ok) {
      setResult({ type: "success", message: response.message });
      setTextContent(""); // Clear textarea on success, keep tenant ID
    } else {
      setResult({ type: "error", message: response.message });
    }
  }, []);

  return {
    tenantId,
    textContent,
    isLoading,
    result,
    setTenantId,
    setTextContent,
    submitIngest,
    clearResult,
  };
}
