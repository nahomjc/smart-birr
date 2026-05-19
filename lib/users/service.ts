import { eq } from "drizzle-orm";
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

export async function getMonthlyExpenses(userId: string) {
  await processDueRecurringExpenses(userId);
  return fetchMonthlyExpenses(userId);
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
