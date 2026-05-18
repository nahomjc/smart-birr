import { Card } from "@/components/ui/card";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById, getMonthlyExpenses } from "@/lib/users/service";
import { requireDb, budgets } from "@/lib/db";
import { eq } from "drizzle-orm";
import { formatBirr, spendingSummary } from "@/lib/finance/budget-engine";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  let summary = { total: 0, byCategory: {} as Record<string, number>, warnings: [] as string[] };
  let userName = "there";
  let income: number | null = null;

  try {
    const user = await getUserById(userId);
    userName = user?.name ?? "there";
    income = user?.income ? Number(user.income) : null;
    const expenses = await getMonthlyExpenses(userId);
    const db = requireDb();
    const budget = await db.query.budgets.findFirst({
      where: eq(budgets.userId, userId),
    });
    summary = spendingSummary(
      expenses,
      budget
        ? {
            monthlyIncome: Number(budget.monthlyIncome),
            savingsGoal: Number(budget.savingsGoal),
            rentLimit: Number(budget.rentLimit),
            foodLimit: Number(budget.foodLimit),
            transportLimit: Number(budget.transportLimit),
            entertainmentLimit: Number(budget.entertainmentLimit),
            emergencyFund: Number(budget.emergencyFund),
            discretionary: 0,
          }
        : null,
    );
  } catch {
    /* DB may be unavailable during first setup */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hello, {userName}
        </h1>
        <p className="mt-1 text-zinc-500">
          {income
            ? `Monthly income: ${formatBirr(income)}`
            : "Set your income in Budget or chat with the AI counselor."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">Spent this month</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
            {formatBirr(summary.total)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Categories tracked</p>
          <p className="mt-1 text-2xl font-semibold">
            {Object.keys(summary.byCategory).length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Budget alerts</p>
          <p className="mt-1 text-2xl font-semibold">
            {summary.warnings.length}
          </p>
        </Card>
      </div>

      {summary.warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {summary.warnings.join(" ")}
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/chat"
          className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2 className="font-semibold">AI Counselor</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Budget help, savings plans, and natural expense logging.
          </p>
        </Link>
        <Link
          href="/dashboard/expenses"
          className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2 className="font-semibold">Expenses</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Track food, transport, rent, and more.
          </p>
        </Link>
      </div>
    </div>
  );
}
