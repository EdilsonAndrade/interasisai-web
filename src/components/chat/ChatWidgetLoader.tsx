"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Lazy-load ChatWidget client-side only (ssr: false) to protect FCP.
// This wrapper must be a Client Component — `next/dynamic` with ssr: false
// is not allowed in Server Components (layout.tsx).
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

export default function ChatWidgetLoader() {
  const pathname = usePathname();

  // Páginas /demo/[slug] carregam o widget embedável do tenant de
  // demonstração (via <script src="/widget/[tenantId]">) — o chat nativo do
  // site sobreporia o mesmo canto da tela, então fica oculto ali.
  if (pathname?.match(/^\/[^/]+\/demo\//)) {
    return null;
  }

  return <ChatWidget />;
}
