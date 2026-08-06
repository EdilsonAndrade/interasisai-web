"use client";

/**
 * Three-dot typing indicator — similar to WhatsApp / iMessage.
 * Each dot animates with a staggered bounce via framer-motion.
 */

export default function ChatStatus() {
  return (
    <div
      className="flex items-center gap-1 rounded-card rounded-bl-sm bg-surface-subtle px-4 py-3"
      aria-label="IA está digitando"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-brand-primary"
          style={{
            animation: `chat-typing-bounce 1.4s ease-in-out ${i * 0.2}s infinite both`,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

