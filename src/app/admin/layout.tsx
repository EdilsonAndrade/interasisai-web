import { cookies } from "next/headers";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const authenticated = hasValidAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  return (
    <>
      {authenticated && <AdminNavigation />}
      {children}
    </>
  );
}