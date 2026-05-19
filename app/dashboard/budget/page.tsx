import Link from "next/link";
import { BudgetOverview } from "@/components/budget/budget-overview";
import { getBudgetPageData } from "@/lib/data/budget";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  let periodLabel = "";
  let plan = null;

  try {
    const data = await getBudgetPageData();
    periodLabel = data.periodLabel;
    plan = data.plan;
  } catch {
    /* DB unavailable */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>Budget</h1>
        <p className={`mt-1 text-sm ${theme.subtext}`}>
          Your saved plan for this month. Edit income and category limits in{" "}
          <Link href="/dashboard/settings" className="text-emerald-400 hover:underline">
            Settings
          </Link>
          .
        </p>
      </div>
      <BudgetOverview periodLabel={periodLabel} plan={plan} />
    </div>
  );
}
