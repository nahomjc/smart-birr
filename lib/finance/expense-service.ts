import { and, desc, eq, gte, lt } from "drizzle-orm";
import { requireDb, expenses } from "../db";
import { getCategoryByName } from "../db/seed-categories";
import { normalizeCategory } from "./categories";
import { getMonthStart } from "./period";

export async function logExpense(
  userId: string,
  amount: number,
  category: string,
  description?: string | null,
  date?: Date,
  aiConfidence?: number | null,
) {
  const db = requireDb();
  const categoryName = normalizeCategory(category);
  const categoryRow = await getCategoryByName(categoryName);
  if (!categoryRow) {
    throw new Error(`Unknown category: ${categoryName}`);
  }

  const now = new Date();
  const [row] = await db
    .insert(expenses)
    .values({
      userId,
      categoryId: categoryRow.id,
      amount: String(amount),
      description: description ?? null,
      aiConfidence:
        aiConfidence != null ? String(Math.min(1, Math.max(0, aiConfidence))) : null,
      date: date ?? now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function getMonthlyExpenses(userId: string) {
  const db = requireDb();
  const monthStart = getMonthStart();
  return getExpensesBetween(userId, monthStart, new Date());
}

export async function getExpensesBetween(
  userId: string,
  start: Date,
  endExclusive: Date,
) {
  const db = requireDb();
  return db.query.expenses.findMany({
    where: and(
      eq(expenses.userId, userId),
      gte(expenses.date, start),
      lt(expenses.date, endExclusive),
    ),
    orderBy: [desc(expenses.date)],
    with: { category: true },
  });
}
