import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getMonthlyExpenses } from "@/lib/users/service";
import {
  getBudgetAllocation,
  getCurrentBudget,
} from "@/lib/finance/budget-service";
import { generateBudgetPlan, spendingSummary } from "@/lib/finance/budget-engine";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { expenses: monthExpenses } = await getMonthlyExpenses(userId);
    const budget = await getCurrentBudget(userId);
    const allocation = await getBudgetAllocation(userId);
    const plan = budget
      ? generateBudgetPlan(Number(budget.monthlyIncome))
      : null;

    const summary = spendingSummary(monthExpenses, allocation);

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
