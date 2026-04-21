import { useState, useRef, useCallback } from "react";
import type { ChatMessage } from "@/context/ChatContext";

type UseChatAssistantReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioError: string | null;
  sendMessage: (text: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
};

const MOCK_AI_REPLY = "Olá! Sou o assistente da Interasis AI. Como posso ajudar você hoje?";

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
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `${Date.now()}-ai`,
        role: "ai",
        content: MOCK_AI_REPLY,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  }, []);

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
          console.log(`[Audio Blob] size: ${blob.size} bytes`);
        }
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recorder.onerror = () => {
        setAudioError("Erro na gravação. Tente novamente.");
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setAudioError("Permissão de microfone necessária");
    }
  }, [isRecording]);

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
    sendMessage,
    startRecording,
    stopRecording,
  };
}
