import { Card } from "@/components/ui/card";
import { RecurringForm } from "@/components/recurring/recurring-form";
import { RecurringList } from "@/components/recurring/recurring-list";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserRecurringExpenses } from "@/lib/finance/recurring-service";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const userId = await getSessionUserId();
  let items: Awaited<ReturnType<typeof getUserRecurringExpenses>> = [];

  if (userId) {
    try {
      items = await getUserRecurringExpenses(userId);
    } catch {
      /* DB unavailable */
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>Recurring bills</h1>
        <p className={`mt-1 max-w-2xl text-sm ${theme.subtext}`}>
          Bills that repeat on a schedule (rent, subscriptions, transport passes).
          When a bill is due, Smart Birr logs it as an expense and moves the next
          due date forward. Due dates also show on the{" "}
          <a
            href="/dashboard/calendar"
            className="text-emerald-400 hover:underline"
          >
            Calendar
          </a>
          .
        </p>
      </div>

      <Card>
        <h2 className="mb-4 font-medium text-zinc-100">Add recurring bill</h2>
        <RecurringForm />
      </Card>

      <Card>
        <h2 className="mb-4 font-medium text-zinc-100">Your schedules</h2>
        <RecurringList items={items} />
      </Card>
    </div>
  );
}
