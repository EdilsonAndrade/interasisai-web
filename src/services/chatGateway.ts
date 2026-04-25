import type {
  BffErrorPayload,
  BffSuccessPayload,
  ChatGatewayFailure,
  ChatGatewayResult,
  SendAudioMessageInput,
  SendTextMessageInput,
} from "./chatGateway.types";

const DEFAULT_CHAT_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT ?? "/chat/messages";

function getEndpoint(customEndpoint?: string): string {
  return customEndpoint?.trim() || DEFAULT_CHAT_ENDPOINT;
}

function getMessageFromErrorPayload(payload: BffErrorPayload | null, fallback: string): string {
  if (!payload) return fallback;
  if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
  return fallback;
}

function isRetryableStatus(status: number): boolean {
  return status === 0 || status === 408 || status === 429 || status >= 500;
}

async function parseJsonSafely(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildFailure(status: number, message: string, raw?: unknown): ChatGatewayFailure {
  return {
    ok: false,
    status,
    message,
    retryable: isRetryableStatus(status),
    raw,
  };
}

export async function normalizeBffResponse(response: Response): Promise<ChatGatewayResult> {
  const payload = await parseJsonSafely(response);

  if (response.ok) {
    const successPayload = payload as BffSuccessPayload | null;
    const reply =
      successPayload && typeof successPayload.reply === "string" && successPayload.reply.trim()
        ? successPayload.reply
        : "Recebemos sua mensagem e já estamos processando.";

    return {
      ok: true,
      reply,
      status: response.status,
      raw: payload,
    };
  }

  const errorPayload = payload as BffErrorPayload | null;
  return buildFailure(
    response.status,
    getMessageFromErrorPayload(errorPayload, "Falha ao enviar mensagem para o assistente."),
    payload,
  );
}

export async function sendTextMessageToBff(input: SendTextMessageInput): Promise<ChatGatewayResult> {
  const text = input.text.trim();

  if (!text) {
    return buildFailure(400, "Mensagem de texto vazia.");
  }

  try {
    const response = await fetch(getEndpoint(input.endpoint), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: "text",
        text,
      }),
    });

    return normalizeBffResponse(response);
  } catch {
    return buildFailure(0, "Não foi possível se conectar ao serviço de mensagens.");
  }
}

export async function sendAudioMessageToBff(input: SendAudioMessageInput): Promise<ChatGatewayResult> {
  if (input.audio.size <= 0) {
    return buildFailure(400, "Áudio inválido para envio.", {
      originalDurationMs: input.originalDurationMs,
      optimizedDurationMs: input.optimizedDurationMs,
    });
  }

  if (input.optimizedDurationMs >= input.originalDurationMs) {
    return buildFailure(400, "A duração otimizada precisa ser menor que a duração original.", {
      originalDurationMs: input.originalDurationMs,
      optimizedDurationMs: input.optimizedDurationMs,
    });
  }

  const formData = new FormData();
  formData.append("kind", "audio");
  formData.append("audio", input.audio, "optimized-audio.wav");
  formData.append("originalDurationMs", String(input.originalDurationMs));
  formData.append("optimizedDurationMs", String(input.optimizedDurationMs));

  try {
    const response = await fetch(getEndpoint(input.endpoint), {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return normalizeBffResponse(response);
  } catch {
    return buildFailure(0, "Não foi possível se conectar ao serviço de mensagens.");
  }
}
