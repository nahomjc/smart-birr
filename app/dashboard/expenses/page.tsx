import { Card } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { getSessionUserId } from "@/lib/auth/session";
import { getMonthlyExpenses } from "@/lib/users/service";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const userId = await getSessionUserId();
  let expenses: Awaited<
    ReturnType<typeof getMonthlyExpenses>
  >["expenses"] = [];

  if (userId) {
    try {
      const result = await getMonthlyExpenses(userId);
      expenses = result.expenses;
    } catch {
      /* DB unavailable */
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>Expenses</h1>
        <p className={`mt-1 max-w-2xl text-sm ${theme.subtext}`}>
          This page lists money you have already spent — not your budget plan.
          Budget limits live under{" "}
          <a href="/dashboard/budget" className="text-emerald-400 hover:underline">
            Budget
          </a>
          ; totals and alerts are on{" "}
          <a href="/dashboard" className="text-emerald-400 hover:underline">
            Overview
          </a>
          .
        </p>
      </div>
      <Card>
        <h2 className="mb-4 font-medium text-zinc-100">Add expense</h2>
        <ExpenseForm />
      </Card>
      <Card>
        <h2 className="mb-4 font-medium text-zinc-100">This month</h2>
        <ExpenseList expenses={expenses} />
      </Card>
    </div>
  );
}
