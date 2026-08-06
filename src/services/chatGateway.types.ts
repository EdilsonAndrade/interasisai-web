export const MAX_TEXT_LENGTH = 4000;
export const MAX_AUDIO_PAYLOAD_BYTES = 10 * 1024 * 1024;
export const DEFAULT_AUDIO_REPLY_MIME = "audio/mpeg";

export type ChatMessageKind = "text" | "audio";

export type BffSuccessStatus = "completed";
export type BffErrorStatus = "rejected" | "blocked" | "failed";
export type ChatGatewayErrorStatus = BffErrorStatus | "local";

export type BffAudioBlock = {
  mimeType?: string;
  contentBase64?: string;
};

export type BffCacheBlock = {
  cacheable?: boolean;
  source?: string;
};

export type BffSuccessPayload = {
  // Canonical (preferred)
  input_text?: string;
  response_text?: string;
  response_audio_base64?: string;
  // Legacy
  text?: string;
  audio?: BffAudioBlock;
  // Common
  status?: BffSuccessStatus;
  responseId?: string;
  sessionId?: string;
  correlationId?: string;
  cache?: BffCacheBlock;
  // Backwards compat with previous gateway shape
  reply?: string;
  ok?: boolean;
};

export type BffErrorPayload = {
  status?: BffErrorStatus;
  reason?: string;
  error?: string;
  message?: string;
  correlationId?: string;
  ok?: boolean;
};

export type ChatGatewayAudioReply = {
  base64: string;
  mimeType: string;
};

export type ChatGatewayCacheInfo = {
  cacheable: boolean;
  source?: string;
  cacheControl?: string;
};

export type ChatGatewaySuccess = {
  ok: true;
  reply: string;
  audio?: ChatGatewayAudioReply;
  status: number;
  responseId?: string;
  sessionId?: string;
  correlationId?: string;
  cache?: ChatGatewayCacheInfo;
  raw?: unknown;
};

export type ChatGatewayFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
  errorStatus?: ChatGatewayErrorStatus;
  correlationId?: string;
  raw?: unknown;
};

export type ChatGatewayResult = ChatGatewaySuccess | ChatGatewayFailure;

export type SendTextMessageInput = {
  text: string;
  endpoint?: string;
};

export type SendAudioMessageInput = {
  audio: Blob;
  /** Optional companion text (anexado como part `text` do multipart se preenchido). */
  text?: string;
  endpoint?: string;
  /** @deprecated kept only for backwards compatibility; no longer sent to BFF. */
  originalDurationMs?: number;
  /** @deprecated kept only for backwards compatibility; no longer sent to BFF. */
  optimizedDurationMs?: number;
};
