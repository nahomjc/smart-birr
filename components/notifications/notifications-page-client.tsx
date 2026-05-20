"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  getNotificationsForPage,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem,
  type NotificationsSnapshot,
} from "@/app/actions/notifications";
import {
  formatNotificationWhen,
  getNotificationTypeMeta,
  groupNotificationsByDate,
} from "@/lib/notifications/display";
import { theme } from "@/lib/theme";

type Filter = "all" | "unread";

type NotificationsPageClientProps = {
  initial: NotificationsSnapshot;
};

export function NotificationsPageClient({
  initial,
}: NotificationsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");

  const [items, setItems] = useState<NotificationItem[]>(initial.notifications);
  const [unreadCount, setUnreadCount] = useState(initial.unreadCount);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const highlightedRef = useRef<HTMLLIElement | null>(null);

  const applySnapshot = useCallback((data: NotificationsSnapshot) => {
    setItems(data.notifications);
    setUnreadCount(data.unreadCount);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.readAt);
    return items;
  }, [filter, items]);

  const groups = useMemo(
    () => groupNotificationsByDate(filtered),
    [filtered],
  );

  useEffect(() => {
    if (!highlightId || !highlightedRef.current) return;
    highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId]);

  useEffect(() => {
    if (!highlightId) return;
    void markNotificationReadAction(highlightId).then((data) => {
      if (data) applySnapshot(data);
    });
  }, [highlightId, applySnapshot]);

  async function refresh() {
    const data = await getNotificationsForPage();
    applySnapshot(data);
  }

  async function markAllRead() {
    setBusy(true);
    try {
      const data = await markAllNotificationsReadAction();
      applySnapshot(data);
    } finally {
      setBusy(false);
    }
  }

  async function openNotification(id: string) {
    const target = items.find((n) => n.id === id);
    if (target && !target.readAt) {
      const data = await markNotificationReadAction(id);
      if (data) applySnapshot(data);
    }
    router.replace(`/dashboard/notifications?id=${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`text-2xl ${theme.heading}`}>Notifications</h1>
          <p className={`mt-1 max-w-2xl text-sm ${theme.subtext}`}>
            Spending guides, check-ins, budget alerts, and monthly reports from
            Smart Birr.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-900/40 disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" aria-hidden />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-900/30 bg-[#0f1714] px-3 py-1 text-xs text-zinc-400">
          {unreadCount > 0 ? (
            <>
              <span className="font-semibold text-emerald-400">{unreadCount}</span>{" "}
              unread
            </>
          ) : (
            "All caught up"
          )}
        </span>
        {(["all", "unread"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={
              filter === key
                ? "rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-lg border border-emerald-900/30 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-emerald-700/40 hover:text-emerald-300"
            }
          >
            {key === "all" ? "All" : "Unread"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void refresh()}
          className="ml-auto text-xs text-zinc-500 transition hover:text-emerald-400"
        >
          Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className={`${theme.card} flex flex-col items-center py-16 text-center`}>
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Bell className="h-7 w-7" aria-hidden />
          </span>
          <p className="text-sm font-medium text-zinc-200">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className={`mt-2 max-w-sm text-sm ${theme.subtext}`}>
            {filter === "unread"
              ? "You're all caught up. Switch to All to see your history."
              : "Guides and alerts will appear here when cron jobs run or your budget needs attention."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {group.label}
              </h2>
              <ul className="space-y-3">
                {group.items.map((n) => {
                  const meta = getNotificationTypeMeta(n.type);
                  const Icon = meta.icon;
                  const isHighlight = n.id === highlightId;
                  const unread = !n.readAt;

                  return (
                    <li
                      key={n.id}
                      ref={isHighlight ? highlightedRef : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => void openNotification(n.id)}
                        className={`${theme.card} flex w-full gap-4 text-left transition hover:border-emerald-500/35 ${
                          isHighlight
                            ? "ring-1 ring-emerald-500/50"
                            : ""
                        } ${unread ? "border-emerald-800/40" : "opacity-90"}`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconBg}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-zinc-50">
                              {n.title}
                            </span>
                            <span
                              className={`shrink-0 text-[10px] font-medium uppercase tracking-wide ${meta.accent}`}
                            >
                              {meta.label}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-zinc-400">
                            {n.message}
                          </span>
                          <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                            <time dateTime={n.createdAt}>
                              {formatNotificationWhen(n.createdAt)}
                            </time>
                            {unread && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                                New
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
