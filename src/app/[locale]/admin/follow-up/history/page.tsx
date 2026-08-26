import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";
import { FollowUpSubNav } from "@/components/admin/follow-up/FollowUpSubNav";
import { ConversationHistory } from "@/components/admin/follow-up/ConversationHistory";

export const metadata: Metadata = {
  title: "Histórico de Conversa | Interasis AI",
  description: "Consultar histórico de conversa por tenant e thread.",
  openGraph: {
    title: "Histórico de Conversa | Interasis AI",
    description: "Consultar histórico de conversa por tenant e thread.",
  },
};

export default async function FollowUpHistoryPage() {
  const cookieStore = await cookies();
  if (!hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-text-strong">Follow-up</h1>
        <p className="text-sm text-text-body">Consulte o histórico completo de uma conversa por tenant e thread</p>
      </header>

      <FollowUpSubNav />

      <ConversationHistory />
    </section>
  );
}
