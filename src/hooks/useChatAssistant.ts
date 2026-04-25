import { useState, useRef, useCallback } from "react";
import type { ChatMessage } from "@/context/ChatContext";
import {
  sendAudioMessageToBff,
  sendTextMessageToBff,
  type ChatGatewayResult,
} from "@/services";
import { optimizeAudioForBff } from "./audioOptimization";

type UseChatAssistantReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const lastRetryPayloadRef = useRef<RetryPayload | null>(null);

  const appendAssistantReply = useCallback((reply: string) => {
    const aiMsg: ChatMessage = {
      id: `${Date.now()}-ai`,
      role: "ai",
      content: reply || FALLBACK_AI_REPLY,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, aiMsg]);
  }, []);

  const handleGatewayResult = useCallback(
    (result: ChatGatewayResult, retryPayload: RetryPayload) => {
      if (result.ok) {
        appendAssistantReply(result.reply);
        setCanRetry(false);
        lastRetryPayloadRef.current = null;
        return;
      }

      setAudioError(result.message);
      if (result.retryable) {
        lastRetryPayloadRef.current = retryPayload;
        setCanRetry(true);
      }
    },
    [appendAssistantReply],
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
          originalDurationMs: optimized.originalDurationMs,
          optimizedDurationMs: optimized.optimizedDurationMs,
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

  const sendMessage = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmedText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setAudioError(null);

    void sendTextMessageToBff({ text: trimmedText })
      .then((result) => {
        handleGatewayResult(result, {
          kind: "text",
          text: trimmedText,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [handleGatewayResult]);

  const retryLastMessage = useCallback(() => {
    const payload = lastRetryPayloadRef.current;
    if (!payload) return;

    if (payload.kind === "text") {
      setIsLoading(true);
      setAudioError(null);
      void sendTextMessageToBff({ text: payload.text })
        .then((result) => {
          handleGatewayResult(result, payload);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    void sendOptimizedAudio(payload.audioBlob, payload.originalDurationMs);
  }, [handleGatewayResult, sendOptimizedAudio]);

  const startRecording = useCallback(async () => {
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
          const originalDurationMs = startedAt ? Math.max(1, Date.now() - startedAt) : Math.max(1, recordingTime * 1000);
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
    audioError,
    canRetry,
    sendMessage,
    retryLastMessage,
    startRecording,
    stopRecording,
  };
}
