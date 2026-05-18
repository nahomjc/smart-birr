import { Card } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { getSessionUserId } from "@/lib/auth/session";
import { getMonthlyExpenses } from "@/lib/users/service";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const userId = await getSessionUserId();
  let expenses: Awaited<ReturnType<typeof getMonthlyExpenses>> = [];

  if (userId) {
    try {
      expenses = await getMonthlyExpenses(userId);
    } catch {
      /* DB unavailable */
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>Expenses</h1>
        <p className={`mt-1 text-sm ${theme.subtext}`}>
          Track spending by category this month.
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
