import {
  MAX_AUDIO_PAYLOAD_BYTES,
  MAX_TEXT_LENGTH,
  DEFAULT_AUDIO_REPLY_MIME,
} from "./chatGateway.types";
import type {
  BffErrorPayload,
  BffSuccessPayload,
  ChatGatewayAudioReply,
  ChatGatewayCacheInfo,
  ChatGatewayErrorStatus,
  ChatGatewayFailure,
  ChatGatewayResult,
  ChatGatewaySuccess,
  SendAudioMessageInput,
  SendTextMessageInput,
} from "./chatGateway.types";
import {
  buildRequestKey,
  chatResponseCache,
  parseCacheControlMaxAgeMs,
} from "./chatResponseCache";

const FALLBACK_REPLY = "Recebemos sua mensagem e já estamos processando.";
const FALLBACK_ERROR = "Falha ao enviar mensagem para o assistente.";
const NETWORK_ERROR = "Não foi possível se conectar ao serviço de mensagens.";

function getDefaultEndpoint(): string {
  return process.env.NEXT_PUBLIC_CHAT_BFF_ENDPOINT ?? "/chat/message";
}

function getEndpoint(customEndpoint?: string): string {
  return customEndpoint?.trim() || getDefaultEndpoint();
}

function getAudioFilename(blobType: string): string {
  const type = (blobType || "").toLowerCase();
  if (type.startsWith("audio/webm")) return "recording.webm";
  if (type.startsWith("audio/mp4")) return "recording.mp4";
  if (type.startsWith("audio/wav") || type.startsWith("audio/x-wav")) return "recording.wav";
  return "recording.bin";
}

function deriveErrorStatus(
  httpStatus: number,
  payload: BffErrorPayload | null,
): ChatGatewayErrorStatus | undefined {
  if (payload?.status) return payload.status;
  if (httpStatus === 400) return "rejected";
  if (httpStatus === 403) return "blocked";
  if (httpStatus === 429) return "rejected";
  if (httpStatus >= 500) return "failed";
  return undefined;
}

function getMessageFromErrorPayload(payload: BffErrorPayload | null, fallback: string): string {
  if (!payload) return fallback;
  if (typeof payload.reason === "string" && payload.reason.trim()) return payload.reason;
  if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
  return fallback;
}

function isRetryableStatus(status: number): boolean {
  if (status === 0 || status === 408 || status === 429) return true;
  return status >= 500;
}

async function parseJsonSafely(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

type FailureOptions = {
  errorStatus?: ChatGatewayErrorStatus;
  correlationId?: string;
  raw?: unknown;
};

function buildFailure(
  status: number,
  message: string,
  options: FailureOptions = {},
): ChatGatewayFailure {
  return {
    ok: false,
    status,
    message,
    retryable: isRetryableStatus(status),
    errorStatus: options.errorStatus,
    correlationId: options.correlationId,
    raw: options.raw,
  };
}

function pickReply(payload: BffSuccessPayload | null): string {
  if (!payload) return FALLBACK_REPLY;
  if (typeof payload.response_text === "string" && payload.response_text.trim()) {
    return payload.response_text;
  }
  if (typeof payload.text === "string" && payload.text.trim()) {
    return payload.text;
  }
  if (typeof payload.reply === "string" && payload.reply.trim()) {
    return payload.reply;
  }
  return FALLBACK_REPLY;
}

function pickAudio(payload: BffSuccessPayload | null): ChatGatewayAudioReply | undefined {
  if (!payload) return undefined;
  const canonical =
    typeof payload.response_audio_base64 === "string" ? payload.response_audio_base64.trim() : "";
  const legacy =
    typeof payload.audio?.contentBase64 === "string" ? payload.audio.contentBase64.trim() : "";
  const base64 = canonical || legacy;
  if (!base64) return undefined;
  const mimeType = payload.audio?.mimeType?.trim() || DEFAULT_AUDIO_REPLY_MIME;
  return { base64, mimeType };
}

function buildCacheInfo(
  payload: BffSuccessPayload | null,
  cacheControl: string | null,
): ChatGatewayCacheInfo | undefined {
  if (!payload?.cache && !cacheControl) return undefined;
  return {
    cacheable: payload?.cache?.cacheable === true,
    source: payload?.cache?.source,
    cacheControl: cacheControl ?? undefined,
  };
}

export async function normalizeBffResponse(response: Response): Promise<ChatGatewayResult> {
  const payload = await parseJsonSafely(response);

  if (response.ok) {
    const successPayload = payload as BffSuccessPayload | null;
    const cacheControl = response.headers?.get?.("Cache-Control") ?? null;
    return {
      ok: true,
      reply: pickReply(successPayload),
      audio: pickAudio(successPayload),
      status: response.status,
      responseId: successPayload?.responseId,
      sessionId: successPayload?.sessionId,
      correlationId: successPayload?.correlationId,
      cache: buildCacheInfo(successPayload, cacheControl),
      raw: payload,
    };
  }

  const errorPayload = payload as BffErrorPayload | null;
  return buildFailure(response.status, getMessageFromErrorPayload(errorPayload, FALLBACK_ERROR), {
    errorStatus: deriveErrorStatus(response.status, errorPayload),
    correlationId: errorPayload?.correlationId,
    raw: payload,
  });
}

function successFromCache(cached: {
  reply: string;
  audio?: ChatGatewayAudioReply;
  responseId?: string;
  sessionId?: string;
  correlationId?: string;
  cacheControl?: string;
}): ChatGatewaySuccess {
  return {
    ok: true,
    reply: cached.reply,
    audio: cached.audio,
    status: 200,
    responseId: cached.responseId,
    sessionId: cached.sessionId,
    correlationId: cached.correlationId,
    cache: {
      cacheable: true,
      source: "client",
      cacheControl: cached.cacheControl,
    },
  };
}

export async function sendTextMessageToBff(
  input: SendTextMessageInput,
): Promise<ChatGatewayResult> {
  const text = input.text.trim();

  if (!text) {
    return buildFailure(400, "Mensagem de texto vazia.", { errorStatus: "local" });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return buildFailure(413, "A mensagem excede o limite máximo de 4000 caracteres.", {
      errorStatus: "local",
    });
  }

  const cacheKey = buildRequestKey(text);
  const cached = chatResponseCache.get(cacheKey);
  if (cached) {
    return successFromCache(cached);
  }

  let response: Response;
  try {
    response = await fetch(getEndpoint(input.endpoint), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
  } catch {
    return buildFailure(0, NETWORK_ERROR);
  }

  const result = await normalizeBffResponse(response);

  if (result.ok && result.cache?.cacheable && result.cache?.cacheControl) {
    const ttlMs = parseCacheControlMaxAgeMs(result.cache.cacheControl);
    if (ttlMs && ttlMs > 0) {
      chatResponseCache.set(
        cacheKey,
        {
          reply: result.reply,
          audio: result.audio,
          responseId: result.responseId,
          sessionId: result.sessionId,
          correlationId: result.correlationId,
          cacheControl: result.cache.cacheControl,
        },
        ttlMs,
      );
    }
  }

  return result;
}

export async function sendAudioMessageToBff(
  input: SendAudioMessageInput,
): Promise<ChatGatewayResult> {
  if (!input.audio || input.audio.size <= 0) {
    return buildFailure(400, "Áudio inválido para envio.", { errorStatus: "local" });
  }

  if (input.audio.size > MAX_AUDIO_PAYLOAD_BYTES) {
    return buildFailure(413, "O áudio excede o tamanho máximo permitido (10 MB).", {
      errorStatus: "local",
    });
  }

  const formData = new FormData();
  formData.append("audio", input.audio, getAudioFilename(input.audio.type));

  const companionText = typeof input.text === "string" ? input.text.trim() : "";
  if (companionText) {
    if (companionText.length > MAX_TEXT_LENGTH) {
      return buildFailure(413, "A mensagem excede o limite máximo de 4000 caracteres.", {
        errorStatus: "local",
      });
    }
    formData.append("text", companionText);
  }

  try {
    const response = await fetch(getEndpoint(input.endpoint), {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return await normalizeBffResponse(response);
  } catch {
    return buildFailure(0, NETWORK_ERROR);
  }
}
