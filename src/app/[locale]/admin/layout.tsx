import { cookies } from "next/headers";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { OnboardingGuidePanel } from "@/components/admin/onboarding/OnboardingGuidePanel";
import { OnboardingGuideProvider } from "@/context/OnboardingGuideContext";
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from "@/lib/adminSession";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const authenticated = hasValidAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!authenticated) {
    return <>{children}</>;
  }

  return (
    <OnboardingGuideProvider>
      <AdminNavigation />
      {children}
      <OnboardingGuidePanel />
    </OnboardingGuideProvider>
  );
}