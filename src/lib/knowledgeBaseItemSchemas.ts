// ============================================================================
// Knowledge base item validation — EDI-39 (multi-file ingestion)
// ============================================================================

import { z } from "zod";

export const KNOWLEDGE_BASE_ACCEPTED_EXTENSIONS = [".pdf", ".xls", ".xlsx", ".csv"] as const;
export const KNOWLEDGE_BASE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.slice(lastDot).toLowerCase();
}

export const knowledgeBasePastedTextSchema = z
  .string()
  .trim()
  .min(1, "O texto colado não pode estar vazio.");

/**
 * Validates a single File before it is sent to the backend. Returns null when
 * valid, or a user-facing message identifying why the file was rejected.
 */
export function validateKnowledgeBaseFile(file: File): string | null {
  const extension = getExtension(file.name);
  if (!KNOWLEDGE_BASE_ACCEPTED_EXTENSIONS.includes(extension as (typeof KNOWLEDGE_BASE_ACCEPTED_EXTENSIONS)[number])) {
    return `Formato não suportado. Envie apenas ${KNOWLEDGE_BASE_ACCEPTED_EXTENSIONS.join(", ")}.`;
  }
  if (file.size <= 0) {
    return "O arquivo está vazio.";
  }
  if (file.size > KNOWLEDGE_BASE_MAX_FILE_SIZE_BYTES) {
    return "O arquivo excede o limite máximo de 10MB.";
  }
  return null;
}

export type KnowledgeBaseFileValidationResult = {
  file: File;
  error: string | null;
};

export function validateKnowledgeBaseFiles(files: File[]): KnowledgeBaseFileValidationResult[] {
  return files.map((file) => ({ file, error: validateKnowledgeBaseFile(file) }));
}
