import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth/session";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/notification-service";

const patchSchema = z.union([
  z.object({ id: z.string().uuid() }),
  z.object({ markAllRead: z.literal(true) }),
]);

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const [items, unreadCount] = await Promise.all([
      listNotifications(userId),
      getUnreadNotificationCount(userId),
    ]);

    return NextResponse.json({ notifications: items, unreadCount });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = patchSchema.parse(await request.json());

    if ("markAllRead" in body) {
      const updated = await markAllNotificationsRead(userId);
      return NextResponse.json({ updated: updated.length });
    }

    const notification = await markNotificationRead(userId, body.id);
    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
