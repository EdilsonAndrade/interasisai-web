"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

export function WhatsAppQrCodeView({ instanceName }: { instanceName: string }) {
  const router = useRouter();
  const { qrCode, state, loadQrCode, clear } = useWhatsAppConnection();
  const [imageFailed, setImageFailed] = useState(false);
  const attempted = useRef(false);
  const matchingQr = qrCode?.instanceName === instanceName ? qrCode : null;

  useEffect(() => {
    if (!matchingQr && !attempted.current) {
      attempted.current = true;
      void loadQrCode(instanceName);
    }
  }, [instanceName, loadQrCode, matchingQr]);

  const retry = () => {
    setImageFailed(false);
    void loadQrCode(instanceName);
  };

  const close = () => {
    clear();
    router.push("/admin/whatsapp");
  };

  const loading = state.status === "loading" && state.instanceName === instanceName;
  const error =
    imageFailed ||
    (state.status === "error" && state.instanceName === instanceName);

  return (
    <section className="mx-auto w-full max-w-xl space-y-6 px-4 py-12 sm:px-6">
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase text-brand-primary">
          Instância {instanceName}
        </p>
        <h1 className="text-2xl font-bold text-text-strong sm:text-3xl">
          Conectar WhatsApp
        </h1>
      </header>

      <div
        className="flex min-h-[320px] items-center justify-center rounded-card border border-brand-primary/20 bg-white p-5"
        aria-live="polite"
      >
        {loading && (
          <div className="space-y-3 text-center text-gray-700">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" aria-hidden="true" />
            <p>Gerando QR Code...</p>
          </div>
        )}
        {!loading && error && (
          <div className="space-y-4 text-center text-gray-800" role="alert">
            <TriangleAlert className="mx-auto h-8 w-8" aria-hidden="true" />
            <p>
              {state.status === "error"
                ? state.message
                : "Não foi possível exibir este QR Code."}
            </p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-card bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Tentar novamente
            </button>
          </div>
        )}
        {!loading && !error && matchingQr && (
          <Image
            src={matchingQr.dataUrl}
            alt={`QR Code da instância ${instanceName}`}
            width={300}
            height={300}
            unoptimized
            priority
            onError={() => setImageFailed(true)}
            className="h-auto w-full max-w-[300px]"
          />
        )}
      </div>

      <ol className="space-y-3 text-sm text-text-body">
        <li className="flex gap-3"><strong className="text-brand-primary">1.</strong><span>Abra o WhatsApp no celular do cliente.</span></li>
        <li className="flex gap-3"><strong className="text-brand-primary">2.</strong><span>Vá em <strong>Aparelhos Conectados</strong> &gt; <strong>Conectar um aparelho</strong>.</span></li>
        <li className="flex gap-3"><strong className="text-brand-primary">3.</strong><span>Aponte a câmera para a tela.</span></li>
      </ol>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push("/admin/whatsapp")}
          className="flex items-center justify-center gap-2 rounded-card border border-border-subtle px-4 py-3 text-sm text-text-body"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </button>
        <button
          type="button"
          onClick={close}
          className="flex items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Concluído / Fechar
        </button>
      </div>
    </section>
  );
}