import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/context/ChatContext";
import {
  decodeAudioBase64,
  sendAudioMessageToBff,
  type ChatGatewayResult,
  getThreadId,
  getPythonBackendConfig,
  sendChatMessage,
  type PythonChatResult,
} from "@/services";
import { optimizeAudioForBff } from "./audioOptimization";

type UseChatAssistantReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioReplyBlob: Blob | null;
  audioReplyUrl: string | null;
  audioError: string | null;
  canRetry: boolean;
  sendMessage: (text: string) => void;
  retryLastMessage: () => void;
  startRecording: () => void;
  stopRecording: () => void;
};

type RetryPayload =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "audio";
      audioBlob: Blob;
      originalDurationMs: number;
    };

const FALLBACK_AI_REPLY = "Recebemos sua mensagem e já estamos processando.";

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return "";
}

export function useChatAssistant(): UseChatAssistantReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioReplyBlob, setAudioReplyBlob] = useState<Blob | null>(null);
  const [audioReplyUrl, setAudioReplyUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const lastRetryPayloadRef = useRef<RetryPayload | null>(null);
  const audioReplyUrlRef = useRef<string | null>(null);
  const threadIdRef = useRef<string | null>(null);

  const setAudioReply = useCallback((blob: Blob | null) => {
    if (audioReplyUrlRef.current) {
      URL.revokeObjectURL(audioReplyUrlRef.current);
      audioReplyUrlRef.current = null;
    }
    if (blob) {
      const url = URL.createObjectURL(blob);
      audioReplyUrlRef.current = url;
      setAudioReplyBlob(blob);
      setAudioReplyUrl(url);
    } else {
      setAudioReplyBlob(null);
      setAudioReplyUrl(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioReplyUrlRef.current) {
        URL.revokeObjectURL(audioReplyUrlRef.current);
        audioReplyUrlRef.current = null;
      }
    };
  }, []);

  const appendAssistantReply = useCallback((reply: string) => {
    const aiMsg: ChatMessage = {
      id: `${Date.now()}-ai`,
      role: "ai",
      content: reply || FALLBACK_AI_REPLY,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, aiMsg]);
  }, []);

  // Initialize thread_id once on mount
  useEffect(() => {
    if (threadIdRef.current === null) {
      const isRestored = (() => {
        try {
          return localStorage.getItem("chat_thread_id") !== null;
        } catch {
          return false;
        }
      })();
      threadIdRef.current = getThreadId();
      console.info("[SessionManager:threadId]", {
        thread_id: threadIdRef.current,
        source: isRestored ? "restored" : "new",
      });
    }
  }, []);

  const handlePythonResult = useCallback(
    (result: PythonChatResult, retryPayload: RetryPayload) => {
      if (result.ok) {
        appendAssistantReply(result.reply);
        setCanRetry(false);
        lastRetryPayloadRef.current = null;
        setAudioReply(null);

        console.info("[PythonBackend]", {
          thread_id: threadIdRef.current,
          status: result.status,
        });
        return;
      }

      console.error("[PythonBackend:error]", {
        status: result.status,
        message: result.message,
        thread_id: threadIdRef.current,
      });

      setAudioError(result.message);
      if (result.retryable) {
        lastRetryPayloadRef.current = retryPayload;
        setCanRetry(true);
      }
    },
    [appendAssistantReply, setAudioReply],
  );

  const handleGatewayResult = useCallback(
    (result: ChatGatewayResult, retryPayload: RetryPayload) => {
      if (result.ok) {
        appendAssistantReply(result.reply);
        setCanRetry(false);
        lastRetryPayloadRef.current = null;

        if (result.audio?.base64) {
          try {
            const blob = decodeAudioBase64(result.audio.base64, result.audio.mimeType);
            setAudioReply(blob);
          } catch (error) {
            console.error("[ChatGateway:audioDecodeError]", {
              correlationId: result.correlationId ?? null,
              message: (error as Error).message,
            });
            setAudioReply(null);
          }
        } else {
          setAudioReply(null);
        }

        console.info("[ChatGateway]", {
          correlationId: result.correlationId ?? null,
          responseId: result.responseId ?? null,
          sessionId: result.sessionId ?? null,
          status: result.status,
          cacheable: result.cache?.cacheable ?? false,
          cacheSource: result.cache?.source ?? null,
        });
        return;
      }

      console.error("[ChatGateway:error]", {
        correlationId: result.correlationId ?? null,
        status: result.status,
        errorStatus: result.errorStatus ?? null,
        message: result.message,
      });

      setAudioError(result.message);
      if (result.retryable) {
        lastRetryPayloadRef.current = retryPayload;
        setCanRetry(true);
      }
    },
    [appendAssistantReply, setAudioReply],
  );

  const sendOptimizedAudio = useCallback(
    async (blobToOptimize: Blob, originalDurationMs: number) => {
      setIsLoading(true);
      setAudioError(null);

      try {
        const optimized = await optimizeAudioForBff({
          audioBlob: blobToOptimize,
          originalDurationMs,
        });

        const result = await sendAudioMessageToBff({
          audio: optimized.optimizedBlob,
        });

        console.info("[Audio Optimization]", {
          originalDurationMs: optimized.originalDurationMs,
          optimizedDurationMs: optimized.optimizedDurationMs,
          optimizationFactor: optimized.optimizationFactor,
        });

        handleGatewayResult(result, {
          kind: "audio",
          audioBlob: blobToOptimize,
          originalDurationMs,
        });
      } catch {
        setAudioError("Não foi possível otimizar seu áudio. Grave novamente para continuar.");
        setCanRetry(false);
        lastRetryPayloadRef.current = null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleGatewayResult],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) return;

      // Tenant validation guard — abort if config is missing
      let tenantId: string;
      try {
        const cfg = getPythonBackendConfig();
        tenantId = cfg.tenantId;
      } catch (err) {
        setAudioError(
          "Configuração do tenant ausente. Contate o administrador.",
        );
        console.error("[Chat:configError]", {
          message: (err as Error).message,
        });
        return;
      }

      const userMsg: ChatMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        content: trimmedText,
        timestamp: Date.now(),
      };

      const threadId = threadIdRef.current ?? getThreadId();
      threadIdRef.current = threadId;

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setAudioError(null);

      console.info("[PythonBackend:chat]", {
        tenant_id: tenantId,
        thread_id: threadId,
        endpoint: "/api/v1/chat",
      });

      void sendChatMessage(
        { message: trimmedText, thread_id: threadId },
        tenantId,
      )
        .then((result) => {
          handlePythonResult(result, {
            kind: "text",
            text: trimmedText,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [handlePythonResult],
  );

  const retryLastMessage = useCallback(() => {
    const payload = lastRetryPayloadRef.current;
    if (!payload) return;

    if (payload.kind === "text") {
      let tenantId: string;
      try {
        const cfg = getPythonBackendConfig();
        tenantId = cfg.tenantId;
      } catch {
        setAudioError(
          "Configuração do tenant ausente. Contate o administrador.",
        );
        return;
      }

      const threadId = threadIdRef.current ?? getThreadId();
      threadIdRef.current = threadId;

      setIsLoading(true);
      setAudioError(null);
      void sendChatMessage(
        { message: payload.text, thread_id: threadId },
        tenantId,
      )
        .then((result) => {
          handlePythonResult(result, payload);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    void sendOptimizedAudio(payload.audioBlob, payload.originalDurationMs);
  }, [handlePythonResult, sendOptimizedAudio]);

  const startRecording = useCallback(async () => {
    // Audio feature flag guard
    if (process.env.NEXT_PUBLIC_ENABLE_AUDIO !== "true") return;
    if (isRecording) return;

    setAudioError(null);
    setAudioBlob(null);
    chunksRef.current = [];

    if (typeof MediaRecorder === "undefined") {
      setAudioError("Gravação de áudio não suportada neste navegador");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        if (blob.size > 0) {
          setAudioBlob(blob);
          const startedAt = recordingStartedAtRef.current;
          const originalDurationMs = startedAt
            ? Math.max(1, Date.now() - startedAt)
            : Math.max(1, recordingTime * 1000);
          void sendOptimizedAudio(blob, originalDurationMs);
        }
        setIsRecording(false);
        setRecordingTime(0);
        recordingStartedAtRef.current = null;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recorder.onerror = () => {
        setAudioError("Erro na gravação. Tente novamente.");
        setIsRecording(false);
        recordingStartedAtRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingStartedAtRef.current = Date.now();
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setAudioError("Permissão de microfone necessária");
    }
  }, [isRecording, recordingTime, sendOptimizedAudio]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  }, []);

  return {
    messages,
    isLoading,
    isRecording,
    recordingTime,
    audioBlob,
    audioReplyBlob,
    audioReplyUrl,
    audioError,
    canRetry,
    sendMessage,
    retryLastMessage,
    startRecording,
    stopRecording,
  };
}
