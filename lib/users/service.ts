import { and, eq, ne } from "drizzle-orm";
import { mergeTelegramOnlyUserInto } from "./merge-telegram-account";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { buildFinancialContextForUser } from "../ai/build-financial-context";
import {
  requireDb,
  users,
  aiConversations,
  type User,
} from "../db";
import {
  getBudgetAllocation,
  getCurrentBudget,
  upsertBudgetFromIncome,
} from "../finance/budget-service";
import {
  getMonthlyExpenses as fetchMonthlyExpenses,
  logExpense,
} from "../finance/expense-service";
import { processDueRecurringExpenses } from "../finance/recurring-service";

export { logExpense } from "../finance/expense-service";

export type MonthlyExpensesResult = {
  expenses: Awaited<ReturnType<typeof fetchMonthlyExpenses>>;
  autoLogged: Awaited<ReturnType<typeof processDueRecurringExpenses>>;
};

export async function getMonthlyExpenses(
  userId: string,
): Promise<MonthlyExpensesResult> {
  const autoLogged = await processDueRecurringExpenses(userId);
  const expenses = await fetchMonthlyExpenses(userId);
  return { expenses, autoLogged };
}
export {
  upsertBudgetFromIncome,
  getBudgetAllocation,
  getCurrentBudget,
} from "../finance/budget-service";
export { logIncomeEntry, getMonthlyIncomeTotal } from "../finance/income-service";
export {
  createRecurringExpense,
  processDueRecurringExpenses,
} from "../finance/recurring-service";

export async function getOrCreateTelegramUser(
  telegramId: number,
  name?: string,
): Promise<User> {
  const db = requireDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      telegramId,
      name: name ?? "Telegram User",
      currency: "ETB",
    })
    .returning();
  return created;
}

export async function getOrCreateUserFromAuth(
  authUser: SupabaseAuthUser,
): Promise<User> {
  const db = requireDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.authUserId, authUser.id),
  });
  if (existing) return existing;

  const meta = authUser.user_metadata ?? {};
  const name =
    (meta.full_name as string) ||
    (meta.name as string) ||
    authUser.email?.split("@")[0] ||
    "User";

  const [created] = await db
    .insert(users)
    .values({
      authUserId: authUser.id,
      email: authUser.email ?? null,
      name,
      currency: "ETB",
    })
    .returning();
  return created;
}

export async function unlinkTelegramId(userId: string) {
  const db = requireDb();
  await db
    .update(users)
    .set({ telegramId: null })
    .where(eq(users.id, userId));
}

export type LinkTelegramResult = {
  user: User;
  /** True when a bot-only profile was merged into this web account */
  mergedBotAccount: boolean;
};

export async function linkTelegramId(
  userId: string,
  telegramId: number,
): Promise<LinkTelegramResult> {
  if (!Number.isInteger(telegramId) || telegramId <= 0) {
    throw new Error("Enter a valid Telegram user ID from /chatid");
  }

  const db = requireDb();
  const taken = await db.query.users.findFirst({
    where: and(
      eq(users.telegramId, telegramId),
      ne(users.id, userId),
    ),
  });

  let mergedBotAccount = false;
  if (taken) {
    if (taken.authUserId) {
      throw new Error(
        "This Telegram ID is linked to a different web login. Sign in with that account, or use another Telegram account.",
      );
    }
    await mergeTelegramOnlyUserInto(taken.id, userId);
    mergedBotAccount = true;
  }

  const [updated] = await db
    .update(users)
    .set({ telegramId })
    .where(eq(users.id, userId))
    .returning();
  if (!updated) throw new Error("User not found");
  return { user: updated, mergedBotAccount };
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; income?: number },
) {
  const db = requireDb();
  const patch: Partial<{ name: string; income: string }> = {};
  if (data.name) patch.name = data.name;
  if (data.income != null && data.income > 0) {
    patch.income = String(data.income);
  }
  if (Object.keys(patch).length === 0) return;
  await db.update(users).set(patch).where(eq(users.id, userId));
  if (data.income && data.income > 0) {
    await upsertBudgetFromIncome(userId, data.income);
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = requireDb();
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export async function updateUserIncome(userId: string, income: number) {
  await upsertBudgetFromIncome(userId, income);
}

export async function getUserContext(userId: string): Promise<string> {
  await processDueRecurringExpenses(userId);
  return buildFinancialContextForUser(userId);
}

export async function saveConversation(
  userId: string,
  message: string,
  response: string,
) {
  const db = requireDb();
  await db.insert(aiConversations).values({ userId, message, response });
}
