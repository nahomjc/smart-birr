import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BudgetChart } from "@/components/budget/budget-chart";
import type { BudgetAllocation } from "@/lib/finance/budget-engine";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import { formatBirr } from "@/lib/finance/budget-engine";
import { theme } from "@/lib/theme";

type Props = {
  periodLabel: string;
  plan: BudgetAllocation | null;
};

function categoryLimitRows(plan: BudgetAllocation) {
  return EXPENSE_CATEGORIES.map((name) => ({
    name,
    limit: plan.categoryLimits[name] ?? 0,
  })).filter((row) => row.limit > 0);
}

export function BudgetOverview({ periodLabel, plan }: Props) {
  if (!plan) {
    return (
      <Card>
        <p className={`text-sm ${theme.subtext}`}>
          No budget saved for {periodLabel}. Set your income and category limits
          in{" "}
          <Link href="/dashboard/settings" className="text-emerald-400 hover:underline">
            Settings
          </Link>
          .
        </p>
      </Card>
    );
  }

  const chartData = categoryLimitRows(plan).map((row) => ({
    name: row.name,
    value: row.limit,
  }));

  return (
    <div className="space-y-8">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={`text-sm ${theme.subtext}`}>{periodLabel}</p>
          <p className="mt-1 text-lg font-medium text-zinc-100">
            Income {formatBirr(plan.monthlyIncome)}
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="rounded-lg border border-emerald-800/50 bg-[#0f1714] px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-emerald-600/40"
        >
          Edit limits in Settings
        </Link>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <h2 className="mb-4 font-medium text-zinc-100">Category split</h2>
          <BudgetChart data={chartData} />
        </Card>
      )}

      <div>
        <h2 className="mb-3 font-medium text-zinc-100">
          Your expense limits
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className={`text-sm ${theme.subtext}`}>Savings goal</p>
          <p className="mt-1 text-xl font-semibold text-emerald-400">
            {plan.savingsGoal.toLocaleString()} ETB
          </p>
        </Card>
        <Card>
          <p className={`text-sm ${theme.subtext}`}>Emergency fund</p>
          <p className="mt-1 text-xl font-semibold text-emerald-400">
            {plan.emergencyFund.toLocaleString()} ETB
          </p>
        </Card>
      </div>
    </div>
  );
}
