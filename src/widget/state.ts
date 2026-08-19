// ============================================================================
// Widget State — conversation state for the standalone embeddable widget.
// No React/Context here (per plan.md Complexity Tracking): a minimal
// pub-sub store plays the equivalent role for a vanilla DOM UI.
// ============================================================================

import { getThreadId } from "@/services/sessionManager";
import { initSession as apiInitSession, sendMessage as apiSendMessage } from "./network";

export type WidgetMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
};

export type WidgetState = {
  ready: boolean;
  messages: WidgetMessage[];
  isLoading: boolean;
  error: string | null;
};

type Listener = (state: WidgetState) => void;

const GENERIC_SEND_ERROR =
  "Não foi possível enviar sua mensagem. Tente novamente.";

let state: WidgetState = {
  ready: false,
  messages: [],
  isLoading: false,
  error: null,
};

let tenantId: string | null = null;
let accessToken: string | null = null;
const listeners = new Set<Listener>();

function setState(patch: Partial<WidgetState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
}

export function getState(): WidgetState {
  return state;
}

/**
 * Initializes the chat session for a tenant. Resolves `true` only on
 * success — the caller (index.ts) decides whether to render the widget UI
 * at all based on this result (per contracts/widget-loader-contract.md).
 */
export async function initSession(id: string): Promise<boolean> {
  tenantId = id;
  const result = await apiInitSession(id);
  if (!result.ok) return false;

  accessToken = result.accessToken;
  setState({ ready: true });
  return true;
}

async function ensureAccessToken(): Promise<string | null> {
  if (accessToken) return accessToken;
  if (!tenantId) return null;

  const result = await apiInitSession(tenantId);
  if (!result.ok) return null;

  accessToken = result.accessToken;
  return accessToken;
}

export async function sendUserMessage(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed || !tenantId) return;

  const userMessage: WidgetMessage = {
    id: `${Date.now()}-user`,
    role: "user",
    content: trimmed,
    timestamp: Date.now(),
  };
  setState({
    messages: [...state.messages, userMessage],
    isLoading: true,
    error: null,
  });

  const threadId = getThreadId();
  const token = await ensureAccessToken();
  if (!token) {
    setState({ isLoading: false, error: GENERIC_SEND_ERROR });
    return;
  }

  let result = await apiSendMessage({ message: trimmed, thread_id: threadId }, token);

  // Token expirado (401) — renova uma única vez e reenvia, mesmo padrão de useChatAssistant.ts.
  if (!result.ok && result.status === 401) {
    accessToken = null;
    const renewedToken = await ensureAccessToken();
    if (renewedToken) {
      result = await apiSendMessage({ message: trimmed, thread_id: threadId }, renewedToken);
    }
  }

  if (result.ok) {
    const aiMessage: WidgetMessage = {
      id: `${Date.now()}-ai`,
      role: "ai",
      content: result.reply,
      timestamp: Date.now(),
    };
    setState({
      messages: [...state.messages, aiMessage],
      isLoading: false,
      error: null,
    });
    return;
  }

  setState({ isLoading: false, error: result.message || GENERIC_SEND_ERROR });
}
