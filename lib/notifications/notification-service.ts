import { and, count, desc, eq, isNull } from "drizzle-orm";
import { requireDb, notifications } from "@/lib/db";

const BELL_LIST_LIMIT = 12;
const PAGE_LIST_LIMIT = 100;

export async function listNotifications(
  userId: string,
  limit = BELL_LIST_LIMIT,
) {
  const db = requireDb();
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function listAllNotifications(userId: string) {
  return listNotifications(userId, PAGE_LIST_LIMIT);
}

export async function getUnreadNotificationCount(userId: string) {
  const db = requireDb();
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );
  return Number(row?.value ?? 0);
}

export async function markNotificationRead(userId: string, id: string) {
  const db = requireDb();
  const [row] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();
  return row ?? null;
}

export async function markAllNotificationsRead(userId: string) {
  const db = requireDb();
  return db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    )
    .returning();
}
