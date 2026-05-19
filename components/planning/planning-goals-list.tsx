"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  addContribution,
  deleteGoal,
  updateGoalStatus,
  type PlanningActionState,
} from "@/app/actions/planning";
import type { PlanningGoalWithProgress } from "@/lib/data/planning-goals";
import { formatBirr } from "@/lib/finance/budget-engine";
import { theme } from "@/lib/theme";

type Props = {
  goals: PlanningGoalWithProgress[];
};

const statusLabels: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function PlanningGoalsList({ goals }: Props) {
  if (goals.length === 0) {
    return (
      <p className={`text-sm ${theme.subtext}`}>
        No goals yet. Add one above to start tracking savings toward a purchase.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {goals.map((goal) => (
        <li
          key={goal.id}
          className="rounded-lg border border-emerald-900/30 bg-[#0a1210] p-4"
        >
          <GoalCard goal={goal} />
        </li>
      ))}
    </ul>
  );
}

function GoalCard({ goal }: { goal: PlanningGoalWithProgress }) {
  const { savedTotal, percent, remaining } = goal.progress;
  const canContribute =
    goal.status === "active" || goal.status === "paused";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-zinc-100">{goal.title}</h3>
          {goal.description && (
            <p className={`mt-1 text-sm ${theme.subtext}`}>{goal.description}</p>
          )}
          <p className={`mt-1 text-xs ${theme.subtext}`}>
            {statusLabels[goal.status] ?? goal.status}
            {goal.targetDate &&
              ` · Target ${goal.targetDate.toLocaleDateString("en-ET")}`}
          </p>
        </div>
        <p className="text-sm text-emerald-400">
          {formatBirr(savedTotal)} / {formatBirr(goal.targetAmount)}
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-emerald-950/60">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={`text-xs ${theme.subtext}`}>
        {percent}% · {formatBirr(remaining)} left
        {goal.monthsLeftHint != null &&
          ` · ~${goal.monthsLeftHint} months at your monthly savings goal`}
      </p>

      <div className="flex flex-wrap gap-2">
        {goal.status === "active" && (
          <StatusButton goalId={goal.id} status="paused" label="Pause" />
        )}
        {goal.status === "paused" && (
          <StatusButton goalId={goal.id} status="active" label="Resume" />
        )}
        {goal.status !== "completed" && goal.status !== "cancelled" && (
          <StatusButton goalId={goal.id} status="completed" label="Mark done" />
        )}
        {goal.status !== "cancelled" && (
          <StatusButton goalId={goal.id} status="cancelled" label="Cancel" />
        )}
        <DeleteGoalButton goalId={goal.id} />
      </div>

      {canContribute && <ContributionForm goalId={goal.id} />}
    </div>
  );
}

function StatusButton({
  goalId,
  status,
  label,
}: {
  goalId: string;
  status: "active" | "paused" | "completed" | "cancelled";
  label: string;
}) {
  const [state, action, pending] = useActionState<
    PlanningActionState,
    FormData
  >(updateGoalStatus, null);

  return (
    <form action={action}>
      <input type="hidden" name="goalId" value={goalId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-emerald-900/40 px-2 py-1 text-xs text-zinc-300 hover:bg-emerald-950/40"
      >
        {pending ? "…" : label}
      </button>
      {state?.error && (
        <span className="ml-2 text-xs text-red-400">{state.error}</span>
      )}
    </form>
  );
}

function DeleteGoalButton({ goalId }: { goalId: string }) {
  const [state, action, pending] = useActionState<
    PlanningActionState,
    FormData
  >(deleteGoal, null);

  return (
    <form action={action}>
      <input type="hidden" name="goalId" value={goalId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-red-900/40 px-2 py-1 text-xs text-red-300/90 hover:bg-red-950/30"
      >
        {pending ? "…" : "Delete"}
      </button>
      {state?.error && (
        <span className="ml-2 text-xs text-red-400">{state.error}</span>
      )}
    </form>
  );
}

function ContributionForm({ goalId }: { goalId: string }) {
  const [state, action, pending] = useActionState<
    PlanningActionState,
    FormData
  >(addContribution, null);

  return (
    <form
      key={state?.success ? `done-${goalId}` : goalId}
      action={action}
      className="grid gap-3 border-t border-emerald-900/30 pt-4 sm:grid-cols-3"
    >
      <input type="hidden" name="goalId" value={goalId} />
      <label className="block text-sm">
        <span className={`mb-1 block ${theme.subtext}`}>Add savings (ETB)</span>
        <input
          name="amount"
          type="number"
          min="1"
          required
          className={theme.input}
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className={`mb-1 block ${theme.subtext}`}>Note (optional)</span>
        <input name="note" placeholder="e.g. From salary" className={theme.input} />
      </label>
      {state?.error && (
        <p className="text-sm text-red-400 sm:col-span-3">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-400 sm:col-span-3">Contribution saved.</p>
      )}
      <Button type="submit" disabled={pending} className="sm:col-span-3 w-fit">
        {pending ? "Saving…" : "Log contribution"}
      </Button>
    </form>
  );
}
