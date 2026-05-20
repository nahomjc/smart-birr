"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  getNotifications,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem,
  type NotificationsSnapshot,
} from "@/app/actions/notifications";
import {
  formatNotificationWhen,
  getNotificationTypeMeta,
} from "@/lib/notifications/display";

type NotificationBellProps = {
  initial: NotificationsSnapshot;
};

export function NotificationBell({ initial }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(initial.notifications);
  const [unreadCount, setUnreadCount] = useState(initial.unreadCount);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    right: number;
    width: number;
  } | null>(null);

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

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setPanelStyle(null);
      return;
    }

    const margin = 16;
    const maxWidth = 352;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = Math.min(maxWidth, window.innerWidth - margin * 2);
      let right = window.innerWidth - rect.right;
      const leftEdge = window.innerWidth - right - width;
      if (leftEdge < margin) {
        right = window.innerWidth - width - margin;
      }
      setPanelStyle({
        top: rect.bottom + 8,
        right,
        width,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function openNotification(n: NotificationItem) {
    if (!n.readAt) {
      const data = await markNotificationReadAction(n.id);
      if (data) applyNotifications(data);
    }
    setOpen(false);
    router.push(`/dashboard/notifications?id=${n.id}`);
  }

  async function markAllRead() {
    const data = await markAllNotificationsReadAction();
    applyNotifications(data);
  }

  const panel =
    open && panelStyle ? (
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className="fixed z-[200] overflow-hidden rounded-2xl border border-emerald-900/30 bg-[#0f1714] shadow-xl shadow-black/40"
        style={{
          top: panelStyle.top,
          right: panelStyle.right,
          width: panelStyle.width,
        }}
      >
        <div className="flex items-center justify-between border-b border-emerald-900/25 px-4 py-3">
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="text-sm font-semibold text-zinc-100 transition hover:text-emerald-300"
          >
            Notifications
          </Link>
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
            items.map((n) => {
              const meta = getNotificationTypeMeta(n.type);
              const Icon = meta.icon;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => void openNotification(n)}
                    className={`flex w-full gap-3 border-b border-emerald-900/15 px-4 py-3 text-left transition hover:bg-emerald-950/30 ${
                      n.readAt ? "opacity-70" : ""
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-100">
                          {n.title}
                        </p>
                        {!n.readAt && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </span>
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {formatNotificationWhen(n.createdAt)}
                      </p>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <Link
          href="/dashboard/notifications"
          onClick={() => setOpen(false)}
          className="flex items-center justify-between border-t border-emerald-900/25 px-4 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-950/30 hover:text-emerald-300"
        >
          View all notifications
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    ) : null;

  return (
    <>
      <div ref={rootRef} className="relative">
        <button
          ref={buttonRef}
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
      </div>
      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </>
  );
}
