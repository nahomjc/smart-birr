import Link from "next/link";
import { Card } from "@/components/ui/card";
import type {
  PlanningDashboardSummary,
  PlanningGoalWithProgress,
} from "@/lib/data/planning-goals";
import { formatBirr } from "@/lib/finance/budget-engine";
import { theme } from "@/lib/theme";

type Props = {
  summary: PlanningDashboardSummary;
};

export function PlanningGoalsOverview({ summary }: Props) {
  if (summary.activeCount === 0) {
    return (
      <Card>
        <h2 className="font-medium text-zinc-100">Planning vision</h2>
        <p className={`mt-1 text-sm ${theme.subtext}`}>
          Save toward something specific — a laptop, rent deposit, or trip.
        </p>
        <Link
          href="/dashboard/planning"
          className="mt-3 inline-block text-sm text-emerald-400 hover:underline"
        >
          Create your first goal
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-medium text-zinc-100">Planning vision</h2>
      <p className={`mt-1 text-sm ${theme.subtext}`}>
        {summary.activeCount} active goal{summary.activeCount === 1 ? "" : "s"}
      </p>
      <ul className="mt-4 space-y-4">
        {summary.topGoals.map((goal) => (
          <li key={goal.id}>
            <GoalProgressRow goal={goal} />
          </li>
        ))}
      </ul>
      {summary.activeCount > 2 && (
        <p className={`mt-3 text-xs ${theme.subtext}`}>
          +{summary.activeCount - 2} more active goal
          {summary.activeCount - 2 === 1 ? "" : "s"}
        </p>
      )}
      <Link
        href="/dashboard/planning"
        className="mt-3 inline-block text-sm text-emerald-400 hover:underline"
      >
        Manage planning vision
      </Link>
    </Card>
  );
}

function GoalProgressRow({ goal }: { goal: PlanningGoalWithProgress }) {
  const { savedTotal, percent, remaining } = goal.progress;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-zinc-100">{goal.title}</span>
        <span className={theme.subtext}>
          {formatBirr(savedTotal)} / {formatBirr(goal.targetAmount)}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-950/60">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={`mt-1 text-xs ${theme.subtext}`}>
        {percent}% · {formatBirr(remaining)} left
        {goal.monthsLeftHint != null &&
          ` · ~${goal.monthsLeftHint} mo at monthly savings goal`}
      </p>
    </div>
  );
}
