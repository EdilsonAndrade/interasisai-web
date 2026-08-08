export * from "./chatGateway";
export * from "./chatGateway.types";
export { decodeAudioBase64, AudioBase64DecodeError } from "./audioFromBase64";
export {
  chatResponseCache,
  buildRequestKey,
  parseCacheControlMaxAgeMs,
  type CachedReplyEntry,
} from "./chatResponseCache";

// Python Backend — Agendamento IA
export {
  getPythonBackendConfig,
  sendChatMessage,
  ingestKnowledge,
  createWhatsAppInstance,
  getWhatsAppQrCode,
} from "./pythonBackend";
export type {
  PythonBackendConfig,
  PythonChatRequest,
  PythonChatSuccessResponse,
  PythonChatErrorResponse,
  PythonChatSuccess,
  PythonChatFailure,
  PythonChatResult,
  IngestRequest,
  IngestSuccessResponse,
  IngestErrorResponse,
  IngestSuccess,
  IngestFailure,
  IngestResult,
  CreateWhatsAppInstanceRequest,
  CreateWhatsAppInstanceResponse,
  CreateWhatsAppInstanceResult,
  WhatsAppQrCodeResponse,
  WhatsAppQrCodeResult,
  WhatsAppOperationFailure,
} from "./pythonBackend.types";

// Session Manager — Thread ID
export { getThreadId, resetThreadId } from "./sessionManager";
