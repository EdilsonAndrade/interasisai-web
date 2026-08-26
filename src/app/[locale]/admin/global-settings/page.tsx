import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GlobalNotificationRecipients } from "@/components/admin/tenants/GlobalNotificationRecipients";
import { PlanCalculator } from "@/components/admin/tenants/PlanCalculator";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";

export const metadata: Metadata = {
  title: "Configurações Globais | Interasis AI",
  description: "Destinatários de alerta de bloqueio e calculadora de dimensionamento de plano.",
  openGraph: {
    title: "Configurações Globais | Interasis AI",
    description: "Destinatários de alerta de bloqueio e calculadora de dimensionamento de plano.",
  },
};

export default async function GlobalSettingsPage() {
  const cookieStore = await cookies();
  if (!hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-text-strong">Configurações Globais</h1>
      </header>
      <GlobalNotificationRecipients />
      <PlanCalculator />
    </main>
  );
}
