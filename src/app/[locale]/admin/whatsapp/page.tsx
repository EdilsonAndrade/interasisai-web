import type { Metadata } from "next";
import { WhatsAppInstanceForm } from "@/components/admin/WhatsAppInstanceForm";

export const metadata: Metadata = {
  title: "Conectar WhatsApp | Interasis AI",
  description: "Cadastre ou reconecte uma instância WhatsApp.",
  openGraph: {
    title: "Conectar WhatsApp | Interasis AI",
    description: "Cadastre ou reconecte uma instância WhatsApp.",
  },
};

export default function WhatsAppInstancesPage() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-8 px-4 py-12 sm:px-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-text-strong">
          Instâncias WhatsApp
        </h1>
        <p className="text-sm text-text-body">
          Cadastre uma conexão ou recupere o QR Code de uma instância existente.
        </p>
      </header>
      <WhatsAppInstanceForm />
    </section>
  );
}