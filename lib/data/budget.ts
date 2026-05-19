import { getBudgetAllocation } from "@/lib/finance/budget-service";
import { getCurrentPeriod } from "@/lib/finance/period";
import type { BudgetAllocation } from "@/lib/finance/budget-engine";
import { requireUserId } from "@/lib/auth/require-user";

export type BudgetPageData = {
  periodLabel: string;
  plan: BudgetAllocation | null;
};

export async function getBudgetPageData(
  userId?: string,
): Promise<BudgetPageData> {
  const id = userId ?? (await requireUserId());
  const period = getCurrentPeriod();
  const periodLabel = new Date(period.year, period.month - 1, 1).toLocaleDateString(
    "en-ET",
    { month: "long", year: "numeric" },
  );
  const plan = await getBudgetAllocation(id);

  return { periodLabel, plan };
}
