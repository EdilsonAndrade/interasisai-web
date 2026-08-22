"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, QrCode, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import {
  whatsappInstanceSchema,
  type WhatsAppInstanceInput,
} from "@/lib/whatsappSchemas";

export function WhatsAppInstanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createInstance, loadQrCode, state } = useWhatsAppConnection();
  const isLoading = state.status === "loading";
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<WhatsAppInstanceInput>({
    resolver: zodResolver(whatsappInstanceSchema),
    defaultValues: {
      tenantId: searchParams.get("tenantId") ?? "",
      instanceName: searchParams.get("instanceName") ?? "",
    },
  });

  const goToQr = (instanceName: string) =>
    router.push(
      `/admin/whatsapp/${encodeURIComponent(instanceName)}/qrcode`,
    );

  const submitCreate = async (input: WhatsAppInstanceInput) => {
    if (await createInstance(input)) goToQr(input.instanceName);
  };

  const submitReconnect = async () => {
    const instanceName = getValues("instanceName").trim();
    if (!instanceName) {
      setError("instanceName", {
        type: "manual",
        message: "O nome da instância é obrigatório.",
      });
      return;
    }
    if (await loadQrCode(instanceName)) goToQr(instanceName);
  };

  return (
    <form
      onSubmit={handleSubmit(submitCreate)}
      className="space-y-6 rounded-card border border-brand-primary/20 bg-surface-base/60 p-6 backdrop-blur-xl sm:p-8"
    >
      <div className="space-y-2">
        <label htmlFor="whatsapp-tenant" className="text-sm text-text-body">
          Tenant ID
        </label>
        <input
          id="whatsapp-tenant"
          disabled={isLoading}
          aria-invalid={Boolean(errors.tenantId)}
          aria-describedby={errors.tenantId ? "tenant-error" : undefined}
          {...register("tenantId")}
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-text-strong focus:border-brand-primary focus:outline-none disabled:opacity-50"
        />
        {errors.tenantId && (
          <p id="tenant-error" role="alert" className="text-xs text-red-300">
            {errors.tenantId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="whatsapp-instance" className="text-sm text-text-body">
          Nome da instância
        </label>
        <input
          id="whatsapp-instance"
          disabled={isLoading}
          aria-invalid={Boolean(errors.instanceName)}
          aria-describedby={errors.instanceName ? "instance-error" : undefined}
          {...register("instanceName")}
          className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-2.5 text-text-strong focus:border-brand-primary focus:outline-none disabled:opacity-50"
        />
        {errors.instanceName && (
          <p id="instance-error" role="alert" className="text-xs text-red-300">
            {errors.instanceName.message}
          </p>
        )}
      </div>

      {state.status === "error" && (
        <p role="alert" className="flex gap-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-card bg-brand-primary px-4 py-3 text-sm font-semibold text-text-inverse transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {isLoading && state.operation === "create" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <QrCode className="h-4 w-4" aria-hidden="true" />
          )}
          Cadastrar e gerar QR Code
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={submitReconnect}
          className="flex items-center justify-center gap-2 rounded-card border border-brand-primary/40 px-4 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10 disabled:opacity-60"
        >
          {isLoading && state.operation === "reconnect" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          Reconectar / Ver QR Code
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {isLoading ? "Solicitando QR Code." : ""}
      </p>
    </form>
  );
}