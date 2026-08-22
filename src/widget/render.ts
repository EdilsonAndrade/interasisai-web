// ============================================================================
// Widget Render — builds and updates the DOM inside a Shadow Root.
// Vanilla DOM APIs only (no React) — see plan.md Complexity Tracking.
// ============================================================================

import { renderInlineMarkdown } from "./markdown";
import { getState, sendUserMessage, subscribe, type WidgetState } from "./state";
import { buildWidgetCss } from "./styles";

const HOST_ELEMENT_ID = "interasis-chat-widget";

export type WidgetAppearance = {
  primaryColor?: string;
  greetingMessage?: string;
};

function createBubble(): HTMLButtonElement {
  const bubble = document.createElement("button");
  bubble.className = "bubble";
  bubble.type = "button";
  bubble.setAttribute("aria-label", "Abrir chat");
  bubble.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  return bubble;
}

function createPanel(greetingMessage?: string): {
  panel: HTMLDivElement;
  messagesEl: HTMLDivElement;
  errorEl: HTMLDivElement;
  textarea: HTMLTextAreaElement;
  sendButton: HTMLButtonElement;
  closeButton: HTMLButtonElement;
} {
  const panel = document.createElement("div");
  panel.className = "panel";
  panel.hidden = true;

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = "<span>Interasis AI</span>";

  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Fechar chat");
  closeButton.textContent = "✕";
  header.appendChild(closeButton);

  const messagesEl = document.createElement("div");
  messagesEl.className = "messages";

  if (greetingMessage) {
    const greeting = document.createElement("div");
    greeting.className = "message ai";
    greeting.textContent = greetingMessage;
    messagesEl.appendChild(greeting);
  }

  const errorEl = document.createElement("div");
  errorEl.className = "error";
  errorEl.hidden = true;

  const inputRow = document.createElement("div");
  inputRow.className = "input-row";

  const textarea = document.createElement("textarea");
  textarea.rows = 1;
  textarea.placeholder = "Digite sua mensagem...";

  const sendButton = document.createElement("button");
  sendButton.className = "send-button";
  sendButton.type = "button";
  sendButton.disabled = true;
  sendButton.setAttribute("aria-label", "Enviar mensagem");
  sendButton.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>';

  inputRow.appendChild(textarea);
  inputRow.appendChild(sendButton);

  panel.appendChild(header);
  panel.appendChild(messagesEl);
  panel.appendChild(errorEl);
  panel.appendChild(inputRow);

  return { panel, messagesEl, errorEl, textarea, sendButton, closeButton };
}

export function mountWidget(appearance: WidgetAppearance = {}): void {
  if (document.getElementById(HOST_ELEMENT_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ELEMENT_ID;
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = buildWidgetCss(appearance.primaryColor);
  shadowRoot.appendChild(styleEl);

  const bubble = createBubble();
  const { panel, messagesEl, errorEl, textarea, sendButton, closeButton } = createPanel(
    appearance.greetingMessage,
  );

  shadowRoot.appendChild(bubble);
  shadowRoot.appendChild(panel);

  let isOpen = false;

  function setOpen(next: boolean): void {
    isOpen = next;
    panel.hidden = !isOpen;
    bubble.hidden = isOpen;
    if (isOpen) {
      setTimeout(() => textarea.focus(), 50);
    }
  }

  bubble.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));

  function handleSend(): void {
    const text = textarea.value;
    if (!text.trim()) return;
    void sendUserMessage(text);
    textarea.value = "";
    sendButton.disabled = true;
  }

  textarea.addEventListener("input", () => {
    sendButton.disabled = !textarea.value.trim();
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  });

  sendButton.addEventListener("click", handleSend);

  function renderMessages(state: WidgetState): void {
    // Remove previous message/status nodes, keep the optional greeting node in place.
    const existing = messagesEl.querySelectorAll("[data-message-id], [data-status]");
    existing.forEach((node) => node.remove());

    for (const message of state.messages) {
      const el = document.createElement("div");
      el.className = `message ${message.role}`;
      el.dataset.messageId = message.id;
      if (message.role === "ai") {
        el.innerHTML = renderInlineMarkdown(message.content);
      } else {
        el.textContent = message.content;
      }
      messagesEl.appendChild(el);
    }

    if (state.isLoading) {
      const statusEl = document.createElement("div");
      statusEl.className = "typing-indicator";
      statusEl.dataset.status = "loading";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-label", "IA está digitando");
      for (let i = 0; i < 3; i += 1) {
        const dot = document.createElement("span");
        dot.className = "typing-dot";
        dot.style.animationDelay = `${i * 0.2}s`;
        statusEl.appendChild(dot);
      }
      messagesEl.appendChild(statusEl);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;

    errorEl.hidden = !state.error;
    errorEl.textContent = state.error ?? "";
  }

  renderMessages(getState());
  subscribe(renderMessages);
}
