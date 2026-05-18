"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetChart } from "@/components/budget/budget-chart";
import { generateBudget, type BudgetActionState } from "@/app/actions/budget";
import type { BudgetAllocation } from "@/lib/finance/budget-engine";
import { theme } from "@/lib/theme";

type Props = {
  initialIncome: string;
  initialPlan: BudgetAllocation | null;
};

export function BudgetPlanner({ initialIncome, initialPlan }: Props) {
  const [state, action, pending] = useActionState<
    BudgetActionState,
    FormData
  >(generateBudget, null);

  const plan = state?.plan ?? initialPlan;

  const chartData = plan
    ? [
        { name: "Rent", value: plan.rentLimit },
        { name: "Food", value: plan.foodLimit },
        { name: "Transport", value: plan.transportLimit },
        { name: "Save", value: plan.savingsGoal },
        { name: "Emergency", value: plan.emergencyFund },
        { name: "Fun", value: plan.entertainmentLimit },
      ]
    : [];

  return (
    <div className="space-y-8">
      <Card>
        <form action={action} className="space-y-4">
          <label className="block text-sm">
            <span className={`mb-1 block ${theme.subtext}`}>Monthly income (ETB)</span>
            <input
              name="monthlyIncome"
              type="number"
              min="1"
              required
              defaultValue={initialIncome}
              className={`max-w-xs ${theme.input}`}
            />
          </label>
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Generating…" : "Generate budget"}
          </Button>
        </form>
      </Card>

      {plan && (
        <>
          <Card>
            <BudgetChart data={chartData} />
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Rent", plan.rentLimit],
              ["Food", plan.foodLimit],
              ["Transport", plan.transportLimit],
              ["Savings", plan.savingsGoal],
              ["Emergency fund", plan.emergencyFund],
              ["Entertainment", plan.entertainmentLimit],
              ["Discretionary", plan.discretionary],
            ].map(([label, value]) => (
              <Card key={String(label)}>
                <p className={`text-sm ${theme.subtext}`}>{label}</p>
                <p className="mt-1 text-xl font-semibold text-zinc-100">
                  {Number(value).toLocaleString()} ETB
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
