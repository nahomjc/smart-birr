import Link from "next/link";
import { DashboardNav } from "@/components/layout/nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getSupabaseUser } from "@/lib/auth/session";
import { Logo } from "@/components/landing/logo";
import { theme } from "@/lib/theme";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getSupabaseUser();

  return (
    <div className="min-h-full bg-[#060d0b] text-zinc-100">
      <header className="border-b border-emerald-900/30 bg-[#0a1210]/95 backdrop-blur-xl">
        <div
          className={`${theme.dashboardShell} flex items-center justify-between py-4`}
        >
          <Link href="/dashboard">
            <Logo light />
          </Link>
          <div className="flex items-center gap-4">
            {authUser?.email && (
              <span className="hidden text-sm text-zinc-500 sm:inline">
                {authUser.email}
              </span>
            )}
            <Link
              href="/"
              className="text-sm text-zinc-400 transition hover:text-emerald-400"
            >
              Home
            </Link>
            <NotificationBell />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className={`${theme.dashboardShell} py-8`}>
        <DashboardNav />
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
