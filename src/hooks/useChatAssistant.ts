import { useState, useRef, useCallback } from "react";
import type { ChatMessage } from "@/context/ChatContext";

type UseChatAssistantReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  isRecording: boolean;
  audioError: string | null;
  transcript: string;
  sendMessage: (text: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
};

const MOCK_AI_REPLY = "Olá! Sou o assistente da Interasis AI. Como posso ajudar você hoje?";

// Web Speech API — webkit prefix fallback for cross-browser support
type SpeechRecognitionCtor = new () => SpeechRecognition;
function getSpeechRecognitionClass(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as SpeechRecognitionCtor | undefined;
}

export function useChatAssistant(): UseChatAssistantReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  const startRecording = useCallback(() => {
    setAudioError(null);
    setTranscript("");

    const RecognitionClass = getSpeechRecognitionClass();
    if (!RecognitionClass) {
      setAudioError("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    const recognition = new RecognitionClass();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(text);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setAudioError("Permissão de microfone necessária");
      } else {
        setAudioError("Erro ao reconhecer voz. Tente novamente.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  return { messages, isLoading, isRecording, audioError, transcript, sendMessage, startRecording, stopRecording };
}
