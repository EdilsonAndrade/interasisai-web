import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SystemPromptsPage } from "@/components/admin/system-prompts/SystemPromptsPage";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";

export const metadata: Metadata = {
  title: "Prompts do Sistema | Interasis AI",
  description: "Administração dos prompts do sistema com versionamento e rollback.",
  openGraph: {
    title: "Prompts do Sistema | Interasis AI",
    description: "Administração dos prompts do sistema com versionamento e rollback.",
  },
};

export default async function SystemPromptsRoute() {
  const cookieStore = await cookies();
  if (!hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return <SystemPromptsPage />;
}
