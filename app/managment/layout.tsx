import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountMenu } from "@/components/account/account-menu";
import { ManagementSidebar } from "@/components/management/management-sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { loadNotificationsSnapshot } from "@/app/actions/notifications";
import { isSessionUserAdmin } from "@/lib/auth/admin";
import { authAvatarUrl, authDisplayName } from "@/lib/auth/display";
import { getSessionUserId, getSupabaseUser } from "@/lib/auth/session";
import { Logo } from "@/components/landing/logo";

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isSessionUserAdmin())) {
    redirect("/dashboard");
  }

  const authUser = await getSupabaseUser();
  const userId = await getSessionUserId();
  const notifications = userId
    ? await loadNotificationsSnapshot(userId)
    : { notifications: [], unreadCount: 0 };

  return (
    <div className="min-h-screen bg-[#06080a] text-zinc-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <ManagementSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#06080a]/95 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 lg:hidden">
                <Logo />
              </div>
              <div className="hidden flex-1 lg:block">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Admin
                </p>
                <p className="text-sm text-zinc-400">
                  Platform operations & user oversight
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="hidden text-sm text-zinc-500 transition hover:text-zinc-300 sm:inline"
                >
                  Home
                </Link>
                <NotificationBell initial={notifications} />
                {authUser && (
                  <AccountMenu
                    displayName={authDisplayName(authUser)}
                    email={authUser.email}
                    avatarUrl={authAvatarUrl(authUser)}
                    showManagement
                  />
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
