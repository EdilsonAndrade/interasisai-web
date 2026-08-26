import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";
import { FollowUpSubNav } from "@/components/admin/follow-up/FollowUpSubNav";
import { FollowUpDashboard } from "@/components/admin/follow-up/FollowUpDashboard";

export const metadata: Metadata = {
  title: "Dashboard de Follow-up | Interasis AI",
  description: "KPIs de follow-up: pendentes, breakdown por outcome, ofertas expiradas.",
  openGraph: {
    title: "Dashboard de Follow-up | Interasis AI",
    description: "KPIs de follow-up: pendentes, breakdown por outcome, ofertas expiradas.",
  },
};

export default async function FollowUpDashboardPage() {
  const cookieStore = await cookies();
  if (!hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-text-strong">Follow-up</h1>
        <p className="text-sm text-text-body">Visão geral dos follow-ups pendentes e ofertas configuradas</p>
      </header>

      <FollowUpSubNav />

      <FollowUpDashboard />
    </section>
  );
}
