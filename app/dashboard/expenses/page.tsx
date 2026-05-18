import { Card } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { getSessionUserId } from "@/lib/auth/session";
import { getMonthlyExpenses } from "@/lib/users/service";

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
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track spending by category this month.
        </p>
      </div>
      <Card>
        <h2 className="mb-4 font-medium">Add expense</h2>
        <ExpenseForm />
      </Card>
      <Card>
        <h2 className="mb-4 font-medium">This month</h2>
        <ExpenseList expenses={expenses} />
      </Card>
    </div>
  );
}
