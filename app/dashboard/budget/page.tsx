import { getBudgetPageData } from "@/lib/data/budget";
import { BudgetPlanner } from "@/components/budget/budget-planner";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  let initialIncome = "";
  let initialPlan = null;

  try {
    const data = await getBudgetPageData();
    initialIncome = data.monthlyIncome;
    initialPlan = data.plan;
  } catch {
    /* DB unavailable */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>Budget planner</h1>
        <p className={`mt-1 text-sm ${theme.subtext}`}>
          AI-inspired 50/30/20-style plan for Ethiopian Birr.
        </p>
      </div>
      <BudgetPlanner
        initialIncome={initialIncome}
        initialPlan={initialPlan}
      />
    </div>
  );
}
