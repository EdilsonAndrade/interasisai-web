"use client";

import dynamic from "next/dynamic";

// Lazy-load ChatWidget client-side only (ssr: false) to protect FCP.
// This wrapper must be a Client Component — `next/dynamic` with ssr: false
// is not allowed in Server Components (layout.tsx).
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

export default function ChatWidgetLoader() {
  return <ChatWidget />;
}
