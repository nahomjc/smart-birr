import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { getMonthlyExpenses } from "@/lib/users/service";
import { requireDb, budgets } from "@/lib/db";
import { generateBudgetPlan, spendingSummary } from "@/lib/finance/budget-engine";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const monthExpenses = await getMonthlyExpenses(userId);
    const db = requireDb();
    const budget = await db.query.budgets.findFirst({
      where: eq(budgets.userId, userId),
    });

    const plan = budget
      ? generateBudgetPlan(Number(budget.monthlyIncome))
      : null;

    const summary = spendingSummary(monthExpenses, plan);

    return NextResponse.json({
      expenses: monthExpenses,
      summary,
      budget,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
