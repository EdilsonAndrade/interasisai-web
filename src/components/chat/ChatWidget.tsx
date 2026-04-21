"use client";

import { useRef, useEffect, useState, useCallback, type KeyboardEvent, type ChangeEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { MessageCircle, X, Send, Mic, MicOff } from "lucide-react";

import { useChat } from "@/context/ChatContext";
import { useChatAssistant } from "@/hooks/useChatAssistant";
import ChatStatus from "./ChatStatus";

// ─── Animation variants ───────────────────────────────────────────────────────

const desktopVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "easeIn" } },
};

const mobileVariants: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

// ─── ChatWidget ───────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const { isOpen, open, close, toggle } = useChat();
  const { messages, isLoading, isRecording, audioError, transcript, sendMessage, startRecording, stopRecording } =
    useChatAssistant();

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Sync voice transcript → draft textarea
  useEffect(() => {
    if (!transcript) return;
    setDraft(transcript);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [transcript]);

  // Auto-resize textarea
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleSend = useCallback(() => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }, [draft, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  };

  const panelVariants = isMobile ? mobileVariants : desktopVariants;

  // Panel positioning classes — mobile: bottom-sheet; desktop: fixed bottom-right widget
  const panelClasses = isMobile
    ? "fixed bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl z-50 flex flex-col"
    : "fixed bottom-6 right-6 w-96 h-[600px] rounded-card z-50 flex flex-col";

  return (
    <>
      {/* ── Floating trigger button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            aria-label="Abrir chat"
            onClick={toggle}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-text-inverse shadow-floating transition hover:bg-brand-primary-hover"
          >
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${panelClasses} border border-brand-primary/20 bg-surface-base/80 shadow-floating backdrop-blur-xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-primary/10 px-4 py-3">
              <span className="font-space-grotesk font-bold text-text-strong">Interasis AI</span>
              <button
                aria-label="Fechar chat"
                onClick={close}
                className="rounded-button p-1 text-text-body transition hover:text-text-strong"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={
                      msg.role === "user"
                        ? "max-w-[80%] rounded-card rounded-br-sm bg-brand-primary px-4 py-2 text-sm text-text-inverse"
                        : "max-w-[80%] rounded-card rounded-bl-sm bg-surface-subtle px-4 py-2 text-sm text-text-strong"
                    }
                  >
                    {msg.content}
                  </p>
                </div>
              ))}

              {/* ChatStatus — shown while loading, animated in/out */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    key="chat-status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-start"
                  >
                    <ChatStatus />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-brand-primary/10 px-4 py-3">
              {/* Audio error message */}
              {audioError && (
                <p
                  aria-live="assertive"
                  className="mb-2 text-sm text-red-400"
                >
                  {audioError}
                </p>
              )}

              <div className="flex items-end gap-2">
                {/* Auto-growing textarea */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={draft}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="max-h-32 flex-1 resize-none overflow-y-auto rounded-button border border-border-subtle bg-transparent px-3 py-2 text-sm text-text-strong placeholder:text-text-body focus:border-brand-primary/50 focus:outline-none"
                  style={{ height: "auto" }}
                />

                {/* Mic button */}
                <button
                  aria-label={isRecording ? "Parar gravação" : "Gravar mensagem de voz"}
                  onClick={handleMicToggle}
                  className={`flex-shrink-0 rounded-button p-2 transition ${
                    isRecording
                      ? "animate-pulse text-brand-primary motion-reduce:animate-none"
                      : "text-text-body hover:text-text-strong"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Mic className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>

                {/* Send button */}
                <button
                  aria-label="Enviar mensagem"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="flex-shrink-0 rounded-button bg-brand-primary p-2 text-text-inverse transition hover:bg-brand-primary-hover disabled:opacity-40"
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
