import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";
import { FollowUpSubNav } from "@/components/admin/follow-up/FollowUpSubNav";
import { FollowUpQueuePageClient } from "@/components/admin/follow-up/FollowUpQueuePageClient";

export const metadata: Metadata = {
  title: "Fila de Follow-up | Interasis AI",
  description: "Revisar e aprovar rascunhos de follow-up gerados automaticamente.",
  openGraph: {
    title: "Fila de Follow-up | Interasis AI",
    description: "Revisar e aprovar rascunhos de follow-up gerados automaticamente.",
  },
};

export default async function FollowUpQueuePage() {
  const cookieStore = await cookies();
  if (!hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-text-strong">Follow-up</h1>
        <p className="text-sm text-text-body">Revise e aprove rascunhos de follow-up gerados automaticamente</p>
      </header>

      <FollowUpSubNav />

      <FollowUpQueuePageClient />
    </section>
  );
}
