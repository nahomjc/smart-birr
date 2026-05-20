import { Suspense } from "react";
import { loadNotificationsPage } from "@/app/actions/notifications";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { getSessionUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const initial = await loadNotificationsPage(userId);

  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-zinc-500">
          Loading notifications…
        </div>
      }
    >
      <NotificationsPageClient initial={initial} />
    </Suspense>
  );
}
