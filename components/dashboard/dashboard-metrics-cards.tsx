import { MetricAtmCard } from "./metric-atm-card";
import { formatBirr } from "@/lib/data/dashboard";

type Props = {
  totalSpent: number;
  remaining: number | null;
  savingsGoal: number | null;
  savingsProgress: number | null;
  recurringCount: number;
};

export function DashboardMetricsCards({
  totalSpent,
  remaining,
  savingsGoal,
  savingsProgress,
  recurringCount,
}: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <MetricAtmCard
        variant="spent"
        label="Spent this month"
        value={formatBirr(totalSpent)}
        trailingLabel="Debit"
      />
      <MetricAtmCard
        variant="remaining"
        label="Remaining"
        value={remaining != null ? formatBirr(remaining) : "—"}
        trailingLabel="Debit"
      />
      <MetricAtmCard
        variant="savings"
        label="Savings goal"
        value={savingsGoal != null ? formatBirr(savingsGoal) : "—"}
        footnote={
          savingsProgress != null
            ? `~${savingsProgress}% of goal from remaining cash`
            : undefined
        }
        trailingLabel="Debit"
      />
      <MetricAtmCard
        variant="recurring"
        label="Recurring bills"
        value={String(recurringCount)}
        footnote="active schedules"
        trailingLabel="Auto"
      />
    </div>
  );
}
