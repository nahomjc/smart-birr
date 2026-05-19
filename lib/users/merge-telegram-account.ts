import { and, eq } from "drizzle-orm";
import {
  aiConversations,
  budgets,
  categories,
  expenses,
  incomeEntries,
  notifications,
  planningGoals,
  recurringExpenses,
  requireDb,
  users,
} from "@/lib/db";

/**
 * Moves data from a Telegram-only user row (no auth_user_id) into the web
 * account, then deletes the stub. Used when linking Telegram on the dashboard
 * after the user already chatted with the bot.
 */
export async function mergeTelegramOnlyUserInto(
  telegramOnlyUserId: string,
  webUserId: string,
) {
  const db = requireDb();

  const ghost = await db.query.users.findFirst({
    where: eq(users.id, telegramOnlyUserId),
  });
  if (!ghost) return;
  if (ghost.authUserId) {
    throw new Error(
      "This Telegram account is tied to another web login and cannot be merged automatically.",
    );
  }

  const ghostBudgets = await db.query.budgets.findMany({
    where: eq(budgets.userId, telegramOnlyUserId),
  });
  for (const b of ghostBudgets) {
    const conflict = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.userId, webUserId),
        eq(budgets.year, b.year),
        eq(budgets.month, b.month),
      ),
    });
    if (conflict) {
      await db.delete(budgets).where(eq(budgets.id, b.id));
    }
  }

  await db
    .update(expenses)
    .set({ userId: webUserId })
    .where(eq(expenses.userId, telegramOnlyUserId));
  await db
    .update(incomeEntries)
    .set({ userId: webUserId })
    .where(eq(incomeEntries.userId, telegramOnlyUserId));
  await db
    .update(recurringExpenses)
    .set({ userId: webUserId })
    .where(eq(recurringExpenses.userId, telegramOnlyUserId));
  await db
    .update(aiConversations)
    .set({ userId: webUserId })
    .where(eq(aiConversations.userId, telegramOnlyUserId));
  await db
    .update(notifications)
    .set({ userId: webUserId })
    .where(eq(notifications.userId, telegramOnlyUserId));
  await db
    .update(planningGoals)
    .set({ userId: webUserId })
    .where(eq(planningGoals.userId, telegramOnlyUserId));
  await db
    .update(budgets)
    .set({ userId: webUserId })
    .where(eq(budgets.userId, telegramOnlyUserId));
  await db
    .update(categories)
    .set({ userId: webUserId })
    .where(eq(categories.userId, telegramOnlyUserId));

  const web = await db.query.users.findFirst({
    where: eq(users.id, webUserId),
  });
  if (web && !web.income && ghost.income) {
    await db
      .update(users)
      .set({ income: ghost.income })
      .where(eq(users.id, webUserId));
  }

  await db.delete(users).where(eq(users.id, telegramOnlyUserId));
}
