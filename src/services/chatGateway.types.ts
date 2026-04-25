export type ChatMessageKind = "text" | "audio";

export type ChatGatewaySuccess = {
  ok: true;
  reply: string;
  status: number;
  raw?: unknown;
};

export type ChatGatewayFailure = {
  ok: false;
  status: number;
  message: string;
  retryable: boolean;
  raw?: unknown;
};

export type ChatGatewayResult = ChatGatewaySuccess | ChatGatewayFailure;

export type SendTextMessageInput = {
  text: string;
  endpoint?: string;
};

export type SendAudioMessageInput = {
  audio: Blob;
  originalDurationMs: number;
  optimizedDurationMs: number;
  endpoint?: string;
};

export type BffSuccessPayload = {
  ok?: boolean;
  reply?: string;
};

export type BffErrorPayload = {
  ok?: boolean;
  error?: string;
  message?: string;
};
