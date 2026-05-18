import { eq, desc, and, gte } from "drizzle-orm";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import {
  requireDb,
  users,
  expenses,
  budgets,
  aiConversations,
  type User,
} from "../db";
import { generateBudgetPlan } from "../finance/budget-engine";

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
  const db = requireDb();
  await db
    .update(users)
    .set({ income: String(income) })
    .where(eq(users.id, userId));
}

export async function getUserContext(userId: string): Promise<string> {
  const db = requireDb();
  const user = await getUserById(userId);
  if (!user) return "";

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const recentExpenses = await db.query.expenses.findMany({
    where: and(eq(expenses.userId, userId), gte(expenses.date, monthStart)),
    orderBy: [desc(expenses.date)],
    limit: 15,
  });

  const budget = await db.query.budgets.findFirst({
    where: eq(budgets.userId, userId),
  });

  const lines: string[] = [];
  if (user.name) lines.push(`Name: ${user.name}`);
  if (user.income) lines.push(`Monthly income: ${user.income} ${user.currency}`);
  if (budget) {
    lines.push(
      `Budget — savings: ${budget.savingsGoal}, rent: ${budget.rentLimit}, food: ${budget.foodLimit}`,
    );
  }
  if (recentExpenses.length) {
    lines.push("Recent expenses this month:");
    for (const e of recentExpenses) {
      lines.push(`- ${e.category}: ${e.amount} ETB (${e.description ?? "—"})`);
    }
  }
  return lines.join("\n");
}

export async function saveConversation(
  userId: string,
  message: string,
  response: string,
) {
  const db = requireDb();
  await db.insert(aiConversations).values({ userId, message, response });
}

export async function logExpense(
  userId: string,
  amount: number,
  category: string,
  description?: string | null,
) {
  const db = requireDb();
  const [row] = await db
    .insert(expenses)
    .values({
      userId,
      amount: String(amount),
      category,
      description: description ?? null,
    })
    .returning();
  return row;
}

export async function upsertBudgetFromIncome(userId: string, monthlyIncome: number) {
  const db = requireDb();
  const plan = generateBudgetPlan(monthlyIncome);
  const values = {
    userId,
    monthlyIncome: String(plan.monthlyIncome),
    savingsGoal: String(plan.savingsGoal),
    rentLimit: String(plan.rentLimit),
    foodLimit: String(plan.foodLimit),
    transportLimit: String(plan.transportLimit),
    entertainmentLimit: String(plan.entertainmentLimit),
    emergencyFund: String(plan.emergencyFund),
    updatedAt: new Date(),
  };

  const existing = await db.query.budgets.findFirst({
    where: eq(budgets.userId, userId),
  });

  if (existing) {
    const [updated] = await db
      .update(budgets)
      .set(values)
      .where(eq(budgets.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db.insert(budgets).values(values).returning();
  return created;
}

export async function getMonthlyExpenses(userId: string) {
  const db = requireDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return db.query.expenses.findMany({
    where: and(eq(expenses.userId, userId), gte(expenses.date, monthStart)),
    orderBy: [desc(expenses.date)],
  });
}
