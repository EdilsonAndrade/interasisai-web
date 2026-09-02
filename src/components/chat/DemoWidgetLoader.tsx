"use client";

import { useEffect } from "react";

// O bundle do widget embedável monta um elemento próprio direto no
// document.body (fora da árvore do React) — precisamos remover tanto o
// <script> quanto esse elemento ao sair da página ou trocar de tenant,
// senão o widget da demo anterior continua vivo após a navegação (SPA).
const WIDGET_HOST_ELEMENT_ID = "interasis-chat-widget";

interface DemoWidgetLoaderProps {
  tenantId: string;
}

export default function DemoWidgetLoader({ tenantId }: DemoWidgetLoaderProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `/widget/${tenantId}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.getElementById(WIDGET_HOST_ELEMENT_ID)?.remove();
    };
  }, [tenantId]);

  return null;
}
