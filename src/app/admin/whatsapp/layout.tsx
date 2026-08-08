import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WhatsAppConnectionProvider } from "@/context/WhatsAppConnectionContext";
import {
  ADMIN_SESSION_COOKIE,
  hasValidAdminSession,
} from "@/lib/adminSession";

export const metadata: Metadata = {
  title: "Instâncias WhatsApp | Interasis AI",
  description: "Conexão administrativa de instâncias WhatsApp.",
  openGraph: {
    title: "Instâncias WhatsApp | Interasis AI",
    description: "Conexão administrativa de instâncias WhatsApp.",
  },
};

export default async function WhatsAppAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  if (
    !hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
  ) {
    redirect("/admin");
  }

  return <WhatsAppConnectionProvider>{children}</WhatsAppConnectionProvider>;
}