import { eq } from "drizzle-orm";
import { requireDb, budgets } from "@/lib/db";
import { generateBudgetPlan, type BudgetAllocation } from "@/lib/finance/budget-engine";
import { requireUserId } from "@/lib/auth/require-user";

export type BudgetPageData = {
  monthlyIncome: string;
  plan: BudgetAllocation | null;
};

export async function getBudgetPageData(
  userId?: string,
): Promise<BudgetPageData> {
  const id = userId ?? (await requireUserId());
  const db = requireDb();
  const budget = await db.query.budgets.findFirst({
    where: eq(budgets.userId, id),
  });

  if (!budget) {
    return { monthlyIncome: "", plan: null };
  }

  const income = Number(budget.monthlyIncome);
  return {
    monthlyIncome: String(income),
    plan: generateBudgetPlan(income),
  };
}
