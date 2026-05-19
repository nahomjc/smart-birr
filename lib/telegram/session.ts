import { eq } from "drizzle-orm";
import { requireDb, telegramSessions } from "@/lib/db";

export type TelegramSessionState =
  | "idle"
  | "expense_category"
  | "expense_amount"
  | "expense_description";

export type TelegramSessionData = {
  category?: string;
  amount?: number;
  /** lunch | night | manual — set when cron or user starts logging */
  period?: "morning" | "lunch" | "night" | "manual";
};

export type TelegramSession = {
  telegramId: number;
  userId: string;
  state: TelegramSessionState;
  data: TelegramSessionData;
};

export async function getTelegramSession(
  telegramId: number,
): Promise<TelegramSession | null> {
  const db = requireDb();
  const row = await db.query.telegramSessions.findFirst({
    where: eq(telegramSessions.telegramId, telegramId),
  });
  if (!row) return null;
  return {
    telegramId: row.telegramId,
    userId: row.userId,
    state: row.state as TelegramSessionState,
    data: (row.data ?? {}) as TelegramSessionData,
  };
}

export async function upsertTelegramSession(
  telegramId: number,
  userId: string,
  state: TelegramSessionState,
  data: TelegramSessionData = {},
): Promise<void> {
  const db = requireDb();
  await db
    .insert(telegramSessions)
    .values({
      telegramId,
      userId,
      state,
      data,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: telegramSessions.telegramId,
      set: {
        userId,
        state,
        data,
        updatedAt: new Date(),
      },
    });
}

export async function clearTelegramSession(telegramId: number): Promise<void> {
  const db = requireDb();
  await db
    .delete(telegramSessions)
    .where(eq(telegramSessions.telegramId, telegramId));
}
