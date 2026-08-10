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
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant,
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
  Tenant,
  TenantCreateInput,
  TenantWriteInput,
  TenantFieldErrors,
  TenantOperationFailure,
  TenantOperationResult,
  TenantDeleteResult,
} from "./pythonBackend.types";

// Prompt Manager — Prompts & Guardrails
export {
  fetchGuardrails,
  createGuardrail,
  updateGuardrail,
  deleteGuardrail,
  fetchPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  linkTenantToPrompt,
  fetchTenantPromptDetail,
} from "./promptManager";
export type {
  Guardrail,
  Prompt,
  GuardrailCreateInput,
  GuardrailUpdateInput,
  PromptCreateInput,
  PromptUpdateInput,
  TenantLinkInput,
  TenantPromptDetail,
  PromptManagerResult,
  GuardrailListResult,
  GuardrailSingleResult,
  PromptListResult,
  PromptSingleResult,
  TenantLinkResult,
  TenantPromptDetailResult,
  DeleteResult,
} from "./promptManager.types";

// Session Manager — Thread ID
export { getThreadId, resetThreadId } from "./sessionManager";
