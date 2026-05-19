"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetChart } from "@/components/budget/budget-chart";
import { generateBudget, type BudgetActionState } from "@/app/actions/budget";
import type { BudgetAllocation } from "@/lib/finance/budget-engine";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import { formatBirr } from "@/lib/finance/budget-engine";
import { theme } from "@/lib/theme";

type Props = {
  initialIncome: string;
  initialPlan: BudgetAllocation | null;
};

function categoryLimitRows(plan: BudgetAllocation) {
  return EXPENSE_CATEGORIES.map((name) => ({
    name,
    limit: plan.categoryLimits[name] ?? 0,
  })).filter((row) => row.limit > 0);
}

export function BudgetPlanner({ initialIncome, initialPlan }: Props) {
  const [state, action, pending] = useActionState<
    BudgetActionState,
    FormData
  >(generateBudget, null);

  const plan = state?.plan ?? initialPlan;

  const chartData = plan
    ? categoryLimitRows(plan).map((row) => ({
        name: row.name,
        value: row.limit,
      }))
    : [];

  return (
    <div className="space-y-8">
      <Card>
        <form action={action} className="space-y-4">
          <p className={`text-sm ${theme.subtext}`}>
            Enter your monthly income. Smart Birr builds category limits for you
            — you do not add Rent, Food, or Transport one by one.
          </p>
          <label className="block text-sm">
            <span className={`mb-1 block ${theme.subtext}`}>
              Monthly income (ETB)
            </span>
            <input
              name="monthlyIncome"
              type="number"
              min="1"
              required
              defaultValue={initialIncome}
              className={`max-w-xs ${theme.input}`}
            />
          </label>
          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Generating…" : "Generate budget from income"}
          </Button>
        </form>
      </Card>

      {plan && (
        <>
          <Card className="border-emerald-800/40 bg-emerald-950/20">
            <p className="text-sm text-emerald-100/90">
              <span className="font-medium text-emerald-300">Auto-generated plan</span>{" "}
              for {formatBirr(plan.monthlyIncome)} income this month. Percentages
              follow a 50/30/20-style split (rent, food, transport, savings, etc.).
              Adjust income and click generate again to recalculate.
            </p>
          </Card>

          {chartData.length > 0 && (
            <Card>
              <h2 className="mb-4 font-medium text-zinc-100">
                Category split
              </h2>
              <BudgetChart data={chartData} />
            </Card>
          )}

          <div>
            <h2 className="mb-3 font-medium text-zinc-100">
              Expense limits (per category)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryLimitRows(plan).map((row) => (
                <Card key={row.name}>
                  <p className={`text-sm ${theme.subtext}`}>{row.name}</p>
                  <p className="mt-1 text-xl font-semibold text-zinc-100">
                    {row.limit.toLocaleString()} ETB
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-medium text-zinc-100">
              Monthly goals (not expenses)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <p className={`text-sm ${theme.subtext}`}>Savings target</p>
                <p className="mt-1 text-xl font-semibold text-emerald-400">
                  {plan.savingsGoal.toLocaleString()} ETB
                </p>
                <p className={`mt-1 text-xs ${theme.subtext}`}>~20% of income</p>
              </Card>
              <Card>
                <p className={`text-sm ${theme.subtext}`}>Emergency fund</p>
                <p className="mt-1 text-xl font-semibold text-emerald-400">
                  {plan.emergencyFund.toLocaleString()} ETB
                </p>
                <p className={`mt-1 text-xs ${theme.subtext}`}>~10% of income</p>
              </Card>
            </div>
          </div>

          {plan.discretionary > 0 && (
            <p className={`text-sm ${theme.subtext}`}>
              Extra buffer ({formatBirr(plan.discretionary)}) is included in the
              Other category limit above.
            </p>
          )}
        </>
      )}
    </div>
  );
}
