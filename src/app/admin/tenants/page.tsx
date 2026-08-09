import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TenantManagement } from "@/components/admin/tenants/TenantManagement";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";

export const metadata: Metadata = {
  title: "Tenants | Interasis AI",
  description: "Gerenciamento administrativo de tenants.",
  openGraph: {
    title: "Tenants | Interasis AI",
    description: "Gerenciamento administrativo de tenants.",
  },
};

export default async function TenantsPage() {
  const cookieStore = await cookies();
  if (!hasValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }

  return <TenantManagement />;
}