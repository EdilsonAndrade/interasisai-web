import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PromptManagerPage } from "@/components/admin/prompt-manager/PromptManagerPage";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";

export const metadata: Metadata = {
  title: "Prompts & Guardrails | Interasis AI",
  description: "Gerenciamento administrativo de prompts e guardrails da plataforma.",
  openGraph: {
    title: "Prompts & Guardrails | Interasis AI",
    description: "Gerenciamento administrativo de prompts e guardrails da plataforma.",
  },
};

export default async function PromptManagerRoute() {
  const cookieStore = await cookies();
  if (!hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return <PromptManagerPage />;
}
