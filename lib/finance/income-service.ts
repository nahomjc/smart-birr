import { desc, eq, and, gte } from "drizzle-orm";
import { requireDb, incomeEntries } from "../db";
import { getMonthStart } from "./period";

export async function logIncomeEntry(
  userId: string,
  amount: number,
  source: string,
  description?: string | null,
  date?: Date,
) {
  const db = requireDb();
  const [row] = await db
    .insert(incomeEntries)
    .values({
      userId,
      amount: String(amount),
      source,
      description: description ?? null,
      date: date ?? new Date(),
    })
    .returning();
  return row;
}

export async function getMonthlyIncomeEntries(userId: string) {
  const db = requireDb();
  const monthStart = getMonthStart();
  return db.query.incomeEntries.findMany({
    where: and(
      eq(incomeEntries.userId, userId),
      gte(incomeEntries.date, monthStart),
    ),
    orderBy: [desc(incomeEntries.date)],
  });
}

export async function getMonthlyIncomeTotal(userId: string): Promise<number> {
  const entries = await getMonthlyIncomeEntries(userId);
  return entries.reduce((sum, e) => sum + Number(e.amount), 0);
}
