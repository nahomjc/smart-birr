"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotifications,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem,
  type NotificationsSnapshot,
} from "@/app/actions/notifications";

function formatWhen(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type NotificationBellProps = {
  initial: NotificationsSnapshot;
};

export function NotificationBell({ initial }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(initial.notifications);
  const [unreadCount, setUnreadCount] = useState(initial.unreadCount);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const applyNotifications = useCallback((data: NotificationsSnapshot) => {
    setItems(data.notifications);
    setUnreadCount(data.unreadCount);
  }, []);

  const refresh = useCallback(
    async (withLoading = false) => {
      if (withLoading) setLoading(true);
      try {
        const data = await getNotifications();
        applyNotifications(data);
      } finally {
        if (withLoading) setLoading(false);
      }
    },
    [applyNotifications],
  );

  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(() => {
      void getNotifications().then((data) => {
        if (!cancelled) applyNotifications(data);
      });
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [applyNotifications]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function markRead(id: string) {
    const data = await markNotificationReadAction(id);
    if (data) applyNotifications(data);
  }

  async function markAllRead() {
    const data = await markAllNotificationsReadAction();
    applyNotifications(data);
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void refresh(items.length === 0);
        }}
        className="relative rounded-xl p-2 text-zinc-400 transition hover:bg-emerald-950/40 hover:text-emerald-300"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <dialog
          open
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-emerald-900/30 bg-[#0f1714] shadow-xl shadow-black/40"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-emerald-900/25 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-100">Notifications</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-emerald-400 transition hover:text-emerald-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-zinc-500">
                Loading…
              </li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-zinc-500">
                No notifications yet
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.readAt) void markRead(n.id);
                    }}
                    className={`w-full border-b border-emerald-900/15 px-4 py-3 text-left transition hover:bg-emerald-950/30 ${
                      n.readAt ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-100">
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-600">
                        {n.type}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">
                      {n.message}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-600">
                      {formatWhen(n.createdAt)}
                      {!n.readAt && (
                        <span className="ml-2 text-emerald-500">New</span>
                      )}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </dialog>
      )}
    </div>
  );
}