import { requireDb, notifications } from "@/lib/db";

export async function createNotification(
  userId: string,
  data: {
    type: string;
    title: string;
    message: string;
    meta?: Record<string, unknown>;
  },
) {
  const db = requireDb();
  const [row] = await db
    .insert(notifications)
    .values({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.meta ?? null,
    })
    .returning();
  return row;
}
