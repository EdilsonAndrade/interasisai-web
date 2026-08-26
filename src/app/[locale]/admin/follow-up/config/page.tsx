import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";
import { FollowUpSubNav } from "@/components/admin/follow-up/FollowUpSubNav";
import { TenantConfigPanel } from "@/components/admin/follow-up/TenantConfigPanel";

export const metadata: Metadata = {
  title: "Configuração de Ofertas | Interasis AI",
  description: "Configurar oferta vigente e retenção de histórico por tenant.",
  openGraph: {
    title: "Configuração de Ofertas | Interasis AI",
    description: "Configurar oferta vigente e retenção de histórico por tenant.",
  },
};

export default async function FollowUpConfigPage() {
  const cookieStore = await cookies();
  if (!hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-text-strong">Follow-up</h1>
        <p className="text-sm text-text-body">Defina a oferta vigente e o período de retenção do histórico por tenant</p>
      </header>

      <FollowUpSubNav />

      <TenantConfigPanel />
    </section>
  );
}
