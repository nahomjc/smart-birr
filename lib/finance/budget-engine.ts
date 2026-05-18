export type BudgetAllocation = {
  monthlyIncome: number;
  savingsGoal: number;
  rentLimit: number;
  foodLimit: number;
  transportLimit: number;
  entertainmentLimit: number;
  emergencyFund: number;
  discretionary: number;
};

/** 50/30/20-inspired plan tuned for Ethiopian birr budgets */
export function generateBudgetPlan(monthlyIncome: number): BudgetAllocation {
  const income = Math.max(0, monthlyIncome);
  const savingsGoal = Math.round(income * 0.2);
  const rentLimit = Math.round(income * 0.3);
  const foodLimit = Math.round(income * 0.15);
  const transportLimit = Math.round(income * 0.1);
  const entertainmentLimit = Math.round(income * 0.05);
  const emergencyFund = Math.round(income * 0.1);
  const allocated =
    savingsGoal +
    rentLimit +
    foodLimit +
    transportLimit +
    entertainmentLimit +
    emergencyFund;
  const discretionary = Math.max(0, income - allocated);

  return {
    monthlyIncome: income,
    savingsGoal,
    rentLimit,
    foodLimit,
    transportLimit,
    entertainmentLimit,
    emergencyFund,
    discretionary,
  };
}

export function formatBirr(amount: number, currency = "ETB"): string {
  return `${amount.toLocaleString("en-ET")} ${currency}`;
}

export function spendingSummary(
  expenses: { amount: string; category: string }[],
  budget?: BudgetAllocation | null,
) {
  const byCategory: Record<string, number> = {};
  let total = 0;
  for (const e of expenses) {
    const amt = Number(e.amount);
    total += amt;
    byCategory[e.category] = (byCategory[e.category] ?? 0) + amt;
  }
  const warnings: string[] = [];
  if (budget) {
    if ((byCategory.Food ?? 0) > budget.foodLimit) {
      warnings.push(
        `Food spending (${formatBirr(byCategory.Food ?? 0)}) exceeds your food budget (${formatBirr(budget.foodLimit)}).`,
      );
    }
    if ((byCategory.Transport ?? 0) > budget.transportLimit) {
      warnings.push(
        `Transport spending exceeds your transport budget.`,
      );
    }
    if ((byCategory.Rent ?? 0) > budget.rentLimit) {
      warnings.push(`Rent/housing spending exceeds your rent allocation.`);
    }
  }
  return { total, byCategory, warnings };
}
