// ============================================================================
// Widget Styles — minimal, hand-written CSS injected into the Shadow Root.
// Replicates the tokens from the constitution's "Visual Identity Standards"
// table without depending on Tailwind's build pipeline (plan.md Complexity
// Tracking — Tailwind's JIT cannot run for a third-party distributable script).
// ============================================================================

export const DEFAULT_PRIMARY_COLOR = "#1D6FE8";
export const DEFAULT_PRIMARY_HOVER_COLOR = "#1557B7";

export function buildWidgetCss(primaryColor: string = DEFAULT_PRIMARY_COLOR): string {
  return `
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483000;
      width: 56px;
      height: 56px;
      border-radius: 999px;
      border: none;
      background: ${primaryColor};
      color: #FFFFFF;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bubble:hover {
      filter: brightness(1.08);
    }

    .panel {
      position: fixed;
      bottom: 92px;
      right: 24px;
      z-index: 2147483000;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 600px;
      max-height: calc(100vh - 116px);
      border-radius: 16px;
      background: #121A2D;
      border: 1px solid rgba(29, 111, 232, 0.2);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .panel[hidden],
    .bubble[hidden] {
      display: none;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(29, 111, 232, 0.1);
      color: #F8FAFC;
      font-weight: 700;
    }

    .close-button {
      background: none;
      border: none;
      color: #D7DFED;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 4px;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(215, 223, 237, 0.25) transparent;
    }

    .messages::-webkit-scrollbar {
      width: 6px;
    }

    .messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .messages::-webkit-scrollbar-thumb {
      background-color: rgba(215, 223, 237, 0.25);
      border-radius: 999px;
    }

    .messages::-webkit-scrollbar-thumb:hover {
      background-color: rgba(215, 223, 237, 0.4);
    }

    .message {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .message.user {
      align-self: flex-end;
      background: ${primaryColor};
      color: #FFFFFF;
      border-bottom-right-radius: 4px;
    }

    .message.ai {
      align-self: flex-start;
      background: #18233A;
      color: #F8FAFC;
      border-bottom-left-radius: 4px;
    }

    .status {
      align-self: flex-start;
      color: #D7DFED;
      font-size: 13px;
    }

    .error {
      color: #F87171;
      font-size: 13px;
      padding: 0 16px 8px;
    }

    .input-row {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid rgba(29, 111, 232, 0.1);
    }

    .input-row textarea {
      flex: 1;
      resize: none;
      max-height: 96px;
      border-radius: 8px;
      border: 1px solid #2A3550;
      background: transparent;
      color: #F8FAFC;
      padding: 8px 12px;
      font-size: 14px;
    }

    .input-row textarea:focus {
      outline: none;
      border-color: ${primaryColor};
    }

    .send-button {
      flex-shrink: 0;
      border: none;
      border-radius: 8px;
      background: ${primaryColor};
      color: #FFFFFF;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .send-button:disabled {
      opacity: 0.4;
      cursor: default;
    }
  `;
}
