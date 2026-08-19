// ============================================================================
// Widget Network — thin wrapper around the existing Python backend client,
// reused as-is (no duplicated fetch/contract logic) for use outside the
// React/Next.js runtime. See specs/016-embeddable-chat-widget/research.md #1.
// ============================================================================

import {
  initializeChatSession,
  sendChatMessage,
} from "@/services/pythonBackend";
import type {
  PythonChatInitResult,
  PythonChatResult,
} from "@/services/pythonBackend.types";

export type { PythonChatInitResult, PythonChatResult };

export function initSession(tenantId: string): Promise<PythonChatInitResult> {
  return initializeChatSession(tenantId);
}

export function sendMessage(
  request: { message: string; thread_id: string },
  accessToken: string,
): Promise<PythonChatResult> {
  return sendChatMessage(request, accessToken);
}
