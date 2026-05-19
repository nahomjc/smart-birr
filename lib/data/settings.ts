import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import {
  getBudgetAllocation,
  getCurrentBudget,
} from "@/lib/finance/budget-service";
import { getCurrentPeriod } from "@/lib/finance/period";
import { requireUserId } from "@/lib/auth/require-user";

export type BudgetSettingsData = {
  periodLabel: string;
  monthlyIncome: string;
  savingsGoal: string;
  emergencyFund: string;
  categoryLimits: { name: string; limit: string }[];
};

export async function getBudgetSettingsData(
  userId?: string,
): Promise<BudgetSettingsData> {
  const id = userId ?? (await requireUserId());
  const period = getCurrentPeriod();
  const periodLabel = new Date(period.year, period.month - 1, 1).toLocaleDateString(
    "en-ET",
    { month: "long", year: "numeric" },
  );

  const budget = await getCurrentBudget(id);
  const allocation = await getBudgetAllocation(id);

  return {
    periodLabel,
    monthlyIncome: budget ? String(budget.monthlyIncome) : "",
    savingsGoal: allocation ? String(allocation.savingsGoal) : "",
    emergencyFund: allocation ? String(allocation.emergencyFund) : "",
    categoryLimits: EXPENSE_CATEGORIES.map((name) => ({
      name,
      limit: allocation?.categoryLimits[name]
        ? String(allocation.categoryLimits[name])
        : "",
    })),
  };
}
