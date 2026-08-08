import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import {
  ADMIN_SESSION_COOKIE,
  hasValidAdminSession,
} from "@/lib/adminSession";

export const metadata: Metadata = {
  title: "Painel Administrador | Interasis AI",
  description: "Gerenciamento administrativo da Interasis AI.",
  openGraph: {
    title: "Painel Administrador | Interasis AI",
    description: "Gerenciamento administrativo da Interasis AI.",
  },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authenticated = hasValidAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  return authenticated ? <AdminDashboard /> : <AdminLoginForm />;
}
