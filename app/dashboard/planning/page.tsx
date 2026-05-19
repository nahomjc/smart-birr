import { Card } from "@/components/ui/card";
import { PlanningGoalForm } from "@/components/planning/planning-goal-form";
import { PlanningGoalsList } from "@/components/planning/planning-goals-list";
import { getSessionUserId } from "@/lib/auth/session";
import { listPlanningGoals } from "@/lib/data/planning-goals";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  let goals: Awaited<ReturnType<typeof listPlanningGoals>> = [];

  try {
    goals = await listPlanningGoals(userId);
  } catch {
    /* DB unavailable */
  }

  const active = goals.filter((g) => g.status === "active");
  const other = goals.filter((g) => g.status !== "active");

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>Planning vision</h1>
        <p className={`mt-1 max-w-2xl text-sm ${theme.subtext}`}>
          Set savings targets for things you want to buy — laptop, furniture,
          travel — and log each deposit toward them. This is separate from your
          monthly budget savings goal.
        </p>
      </div>

      <Card>
        <h2 className="mb-4 font-medium text-zinc-100">New goal</h2>
        <PlanningGoalForm />
      </Card>

      <Card>
        <h2 className="mb-4 font-medium text-zinc-100">Active goals</h2>
        <PlanningGoalsList goals={active} />
      </Card>

      {other.length > 0 && (
        <Card>
          <h2 className="mb-4 font-medium text-zinc-100">Paused & completed</h2>
          <PlanningGoalsList goals={other} />
        </Card>
      )}
    </div>
  );
}
