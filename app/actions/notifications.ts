"use server";

import { requireUserId } from "@/lib/auth/require-user";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/notification-service";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsSnapshot = {
  notifications: NotificationItem[];
  unreadCount: number;
};

function serializeSnapshot(
  items: Awaited<ReturnType<typeof listNotifications>>,
  unreadCount: number,
): NotificationsSnapshot {
  return {
    notifications: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export async function loadNotificationsSnapshot(
  userId: string,
): Promise<NotificationsSnapshot> {
  const [items, unreadCount] = await Promise.all([
    listNotifications(userId),
    getUnreadNotificationCount(userId),
  ]);
  return serializeSnapshot(items, unreadCount);
}

export async function getNotifications(): Promise<NotificationsSnapshot> {
  const userId = await requireUserId();
  return loadNotificationsSnapshot(userId);
}

export async function markNotificationReadAction(
  id: string,
): Promise<NotificationsSnapshot | null> {
  const userId = await requireUserId();
  const updated = await markNotificationRead(userId, id);
  if (!updated) return null;
  return loadNotificationsSnapshot(userId);
}

export async function markAllNotificationsReadAction(): Promise<NotificationsSnapshot> {
  const userId = await requireUserId();
  await markAllNotificationsRead(userId);
  return loadNotificationsSnapshot(userId);
}
