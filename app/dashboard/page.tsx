import Link from "next/link";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { DashboardMetricsCards } from "@/components/dashboard/dashboard-metrics-cards";
import { MonthlyExportButton } from "@/components/dashboard/monthly-export-button";
import { ExpenseList } from "@/components/expenses/expense-list";
import { Card } from "@/components/ui/card";
import { getSessionUserId } from "@/lib/auth/session";
import { PlanningGoalsOverview } from "@/components/planning/planning-goals-overview";
import { getDashboardOverview, formatBirr } from "@/lib/data/dashboard";
import { isNearMonthEnd } from "@/lib/export/monthly-report-data";
import { getPlanningDashboardSummary } from "@/lib/data/planning-goals";
import { getCurrentPeriod } from "@/lib/finance/period";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  let data: Awaited<ReturnType<typeof getDashboardOverview>> | null = null;
  let planningSummary: Awaited<
    ReturnType<typeof getPlanningDashboardSummary>
  > | null = null;

  try {
    data = await getDashboardOverview(userId);
    planningSummary = await getPlanningDashboardSummary(userId);
  } catch {
    /* DB may be unavailable during first setup */
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className={`text-2xl ${theme.heading}`}>Overview</h1>
        <Card>
          <p className={`text-sm ${theme.subtext}`}>
            Connect your database and run the Supabase migration to see your
            financial snapshot.
          </p>
        </Card>
      </div>
    );
  }

  const savingsProgress =
    data.savingsGoal && data.savingsGoal > 0 && data.remaining != null
      ? Math.min(100, Math.round((data.remaining / data.savingsGoal) * 100))
      : null;

  const period = getCurrentPeriod();
  const nearMonthEnd = isNearMonthEnd();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={`text-sm ${theme.subtext}`}>{data.periodLabel}</p>
          <h1 className={`text-2xl ${theme.heading}`}>Hello, {data.userName}</h1>
          <p className={`mt-1 text-sm ${theme.subtext}`}>
            {data.hasBudget
              ? `Monthly budget: ${formatBirr(data.budgetIncome ?? 0)}`
              : "No budget for this month yet."}
            {data.loggedIncome > 0 &&
              ` · Logged income: ${formatBirr(data.loggedIncome)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthlyExportButton
            periodLabel={data.periodLabel}
            year={period.year}
            month={period.month}
            variant={nearMonthEnd ? "primary" : "secondary"}
          />
          {!data.hasBudget && (
            <Link
              href="/dashboard/settings"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Set budget limits
            </Link>
          )}
        </div>
      </div>

      {nearMonthEnd && (
        <Card className="border-emerald-800/50 bg-emerald-950/25">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-emerald-200">
                End of month report
              </h2>
              <p className={`mt-1 text-sm ${theme.subtext}`}>
                Download your {data.periodLabel} Excel summary with expenses,
                income, category totals, and planning goals.
              </p>
            </div>
            <MonthlyExportButton
              periodLabel={data.periodLabel}
              year={period.year}
              month={period.month}
              variant="primary"
            />
          </div>
        </Card>
      )}

      <DashboardMetricsCards
        totalSpent={data.totalSpent}
        remaining={data.remaining}
        savingsGoal={data.savingsGoal}
        savingsProgress={savingsProgress}
        recurringCount={data.recurringCount}
      />

      {data.warnings.length > 0 && (
        <Card className="border-amber-900/40 bg-amber-950/30">
          <h2 className="mb-2 text-sm font-medium text-amber-200">
            Budget alerts
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-amber-100/90">
            {data.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Card>
      )}

      {planningSummary && (
        <PlanningGoalsOverview summary={planningSummary} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown rows={data.categoryRows} />
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-zinc-100">Recent expenses</h2>
            <Link
              href="/dashboard/expenses"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>
          <ExpenseList expenses={data.recentExpenses} />
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Link href="/dashboard/expenses" className={`${theme.cardHover} block`}>
          <h2 className="font-semibold text-zinc-100">Expenses</h2>
          <p className={`mt-1 text-sm ${theme.subtext}`}>
            Log spending by category.
          </p>
        </Link>
        <Link href="/dashboard/calendar" className={`${theme.cardHover} block`}>
          <h2 className="font-semibold text-zinc-100">Calendar</h2>
          <p className={`mt-1 text-sm ${theme.subtext}`}>
            Daily expenses, income, and due dates.
          </p>
        </Link>
        <Link href="/dashboard/settings" className={`${theme.cardHover} block`}>
          <h2 className="font-semibold text-zinc-100">Settings</h2>
          <p className={`mt-1 text-sm ${theme.subtext}`}>
            Set income and category limits yourself.
          </p>
        </Link>
        <Link href="/dashboard/budget" className={`${theme.cardHover} block`}>
          <h2 className="font-semibold text-zinc-100">Budget</h2>
          <p className={`mt-1 text-sm ${theme.subtext}`}>
            View your saved monthly plan.
          </p>
        </Link>
        <Link href="/dashboard/planning" className={`${theme.cardHover} block`}>
          <h2 className="font-semibold text-zinc-100">Planning</h2>
          <p className={`mt-1 text-sm ${theme.subtext}`}>
            Save toward laptops, trips, and big purchases.
          </p>
        </Link>
        <Link href="/dashboard/chat" className={`${theme.cardHover} block`}>
          <h2 className="font-semibold text-zinc-100">AI Counselor</h2>
          <p className={`mt-1 text-sm ${theme.subtext}`}>
            Ask questions or log expenses in chat.
          </p>
        </Link>
      </div>
    </div>
  );
}
