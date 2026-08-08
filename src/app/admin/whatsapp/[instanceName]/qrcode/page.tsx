import type { Metadata } from "next";
import { WhatsAppQrCodeView } from "@/components/admin/WhatsAppQrCodeView";

type PageProps = {
  params: Promise<{ instanceName: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { instanceName } = await params;
  return {
    title: `QR Code ${instanceName} | Interasis AI`,
    description: "Escaneie o QR Code para conectar a instância WhatsApp.",
    openGraph: {
      title: `QR Code ${instanceName} | Interasis AI`,
      description: "Escaneie o QR Code para conectar a instância WhatsApp.",
    },
  };
}

export default async function WhatsAppQrCodePage({ params }: PageProps) {
  const { instanceName } = await params;
  return <WhatsAppQrCodeView instanceName={instanceName} />;
}