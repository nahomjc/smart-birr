import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { requireUserId } from "@/lib/auth/require-user";
import {
  planningGoalContributions,
  planningGoals,
  requireDb,
  type PlanningGoal,
  type PlanningGoalStatus,
} from "@/lib/db";
import { getBudgetAllocation } from "@/lib/finance/budget-service";

export type PlanningGoalProgress = {
  savedTotal: number;
  percent: number;
  remaining: number;
};

export type PlanningGoalWithProgress = {
  id: string;
  title: string;
  description: string | null;
  targetAmount: number;
  targetDate: Date | null;
  status: PlanningGoalStatus;
  priority: number;
  completedAt: Date | null;
  createdAt: Date;
  progress: PlanningGoalProgress;
  monthsLeftHint: number | null;
};

export type PlanningGoalContributionRow = {
  id: string;
  amount: number;
  note: string | null;
  contributedAt: Date;
};

export type PlanningGoalDetail = PlanningGoalWithProgress & {
  contributions: PlanningGoalContributionRow[];
};

export type PlanningDashboardSummary = {
  activeCount: number;
  topGoals: PlanningGoalWithProgress[];
};

function toNumber(value: string | null | undefined): number {
  return Number(value ?? 0);
}

export function computeGoalProgress(
  targetAmount: number,
  savedTotal: number,
): PlanningGoalProgress {
  const safeTarget = Math.max(0, targetAmount);
  const saved = Math.max(0, savedTotal);
  const percent =
    safeTarget > 0 ? Math.min(100, Math.round((saved / safeTarget) * 100)) : 0;
  return {
    savedTotal: saved,
    percent,
    remaining: Math.max(0, safeTarget - saved),
  };
}

function mapGoalRow(
  goal: PlanningGoal,
  savedTotal: number,
  monthsLeftHint: number | null,
): PlanningGoalWithProgress {
  const targetAmount = toNumber(goal.targetAmount);
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    targetAmount,
    targetDate: goal.targetDate,
    status: goal.status as PlanningGoalStatus,
    priority: goal.priority,
    completedAt: goal.completedAt,
    createdAt: goal.createdAt,
    progress: computeGoalProgress(targetAmount, savedTotal),
    monthsLeftHint,
  };
}

async function savedTotalsByGoalIds(
  goalIds: string[],
): Promise<Map<string, number>> {
  if (goalIds.length === 0) return new Map();
  const db = requireDb();
  const rows = await db
    .select({
      goalId: planningGoalContributions.goalId,
      total: sql<string>`coalesce(sum(${planningGoalContributions.amount}), 0)`,
    })
    .from(planningGoalContributions)
    .where(inArray(planningGoalContributions.goalId, goalIds))
    .groupBy(planningGoalContributions.goalId);

  return new Map(rows.map((r) => [r.goalId, toNumber(r.total)]));
}

async function monthsLeftHintForUser(
  userId: string,
  remaining: number,
): Promise<number | null> {
  const allocation = await getBudgetAllocation(userId);
  const monthly = allocation?.savingsGoal ?? 0;
  if (monthly <= 0 || remaining <= 0) return null;
  return Math.ceil(remaining / monthly);
}

export async function listPlanningGoals(
  userId?: string,
  options?: { status?: PlanningGoalStatus | PlanningGoalStatus[] },
): Promise<PlanningGoalWithProgress[]> {
  const id = userId ?? (await requireUserId());
  const db = requireDb();

  const statuses = options?.status
    ? Array.isArray(options.status)
      ? options.status
      : [options.status]
    : undefined;

  const goals = await db.query.planningGoals.findMany({
    where: statuses
      ? and(
          eq(planningGoals.userId, id),
          inArray(planningGoals.status, statuses),
        )
      : eq(planningGoals.userId, id),
    orderBy: [
      desc(planningGoals.priority),
      desc(planningGoals.createdAt),
    ],
  });

  const totals = await savedTotalsByGoalIds(goals.map((g) => g.id));
  const monthlyHint = await getBudgetAllocation(id);

  return goals.map((goal) => {
    const savedTotal = totals.get(goal.id) ?? 0;
    const targetAmount = toNumber(goal.targetAmount);
    const remaining = Math.max(0, targetAmount - savedTotal);
    const monthly = monthlyHint?.savingsGoal ?? 0;
    const monthsLeftHint =
      monthly > 0 && remaining > 0 ? Math.ceil(remaining / monthly) : null;
    return mapGoalRow(goal, savedTotal, monthsLeftHint);
  });
}

export async function getPlanningGoalDetail(
  goalId: string,
  userId?: string,
): Promise<PlanningGoalDetail | null> {
  const id = userId ?? (await requireUserId());
  const db = requireDb();

  const goal = await db.query.planningGoals.findFirst({
    where: and(eq(planningGoals.id, goalId), eq(planningGoals.userId, id)),
  });
  if (!goal) return null;

  const contributions = await db.query.planningGoalContributions.findMany({
    where: eq(planningGoalContributions.goalId, goalId),
    orderBy: [desc(planningGoalContributions.contributedAt)],
  });

  const savedTotal = contributions.reduce(
    (sum, row) => sum + toNumber(row.amount),
    0,
  );
  const targetAmount = toNumber(goal.targetAmount);
  const remaining = Math.max(0, targetAmount - savedTotal);
  const monthsLeftHint = await monthsLeftHintForUser(id, remaining);

  return {
    ...mapGoalRow(goal, savedTotal, monthsLeftHint),
    contributions: contributions.map((row) => ({
      id: row.id,
      amount: toNumber(row.amount),
      note: row.note,
      contributedAt: row.contributedAt,
    })),
  };
}

export async function getPlanningDashboardSummary(
  userId?: string,
): Promise<PlanningDashboardSummary> {
  const active = await listPlanningGoals(userId, { status: "active" });
  return {
    activeCount: active.length,
    topGoals: active.slice(0, 2),
  };
}

export type CreatePlanningGoalInput = {
  title: string;
  description?: string | null;
  targetAmount: number;
  targetDate?: Date | null;
  priority?: number;
};

export async function createPlanningGoal(
  input: CreatePlanningGoalInput,
  userId?: string,
) {
  const id = userId ?? (await requireUserId());
  const db = requireDb();
  const [created] = await db
    .insert(planningGoals)
    .values({
      userId: id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      targetAmount: String(Math.max(0, input.targetAmount)),
      targetDate: input.targetDate ?? null,
      priority: input.priority ?? 0,
      status: "active",
    })
    .returning();
  return created;
}

export type UpdatePlanningGoalInput = Partial<{
  title: string;
  description: string | null;
  targetAmount: number;
  targetDate: Date | null;
  status: PlanningGoalStatus;
  priority: number;
}>;

export async function updatePlanningGoal(
  goalId: string,
  input: UpdatePlanningGoalInput,
  userId?: string,
) {
  const id = userId ?? (await requireUserId());
  const db = requireDb();

  const existing = await db.query.planningGoals.findFirst({
    where: and(eq(planningGoals.id, goalId), eq(planningGoals.userId, id)),
  });
  if (!existing) {
    throw new Error("Goal not found");
  }

  const patch: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) {
    patch.description = input.description?.trim() || null;
  }
  if (input.targetAmount !== undefined) {
    patch.targetAmount = String(Math.max(0, input.targetAmount));
  }
  if (input.targetDate !== undefined) patch.targetDate = input.targetDate;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.status !== undefined) {
    patch.status = input.status;
    if (input.status === "completed") {
      patch.completedAt = new Date();
    } else if (existing.status === "completed") {
      patch.completedAt = null;
    }
  }

  const [updated] = await db
    .update(planningGoals)
    .set(patch)
    .where(eq(planningGoals.id, goalId))
    .returning();
  return updated;
}

export async function deletePlanningGoal(goalId: string, userId?: string) {
  const id = userId ?? (await requireUserId());
  const db = requireDb();
  const deleted = await db
    .delete(planningGoals)
    .where(and(eq(planningGoals.id, goalId), eq(planningGoals.userId, id)))
    .returning({ id: planningGoals.id });
  if (deleted.length === 0) {
    throw new Error("Goal not found");
  }
}

export async function addPlanningContribution(
  goalId: string,
  amount: number,
  note?: string | null,
  contributedAt?: Date,
  userId?: string,
) {
  const id = userId ?? (await requireUserId());
  const db = requireDb();

  const goal = await db.query.planningGoals.findFirst({
    where: and(eq(planningGoals.id, goalId), eq(planningGoals.userId, id)),
  });
  if (!goal) throw new Error("Goal not found");
  if (goal.status === "cancelled") {
    throw new Error("Cannot add contributions to a cancelled goal");
  }

  const [row] = await db
    .insert(planningGoalContributions)
    .values({
      goalId,
      amount: String(Math.max(0, amount)),
      note: note?.trim() || null,
      contributedAt: contributedAt ?? new Date(),
    })
    .returning();

  const totals = await savedTotalsByGoalIds([goalId]);
  const savedTotal = totals.get(goalId) ?? 0;
  const targetAmount = toNumber(goal.targetAmount);
  if (goal.status === "active" && savedTotal >= targetAmount && targetAmount > 0) {
    await db
      .update(planningGoals)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(planningGoals.id, goalId));
  }

  return row;
}

export async function deletePlanningContribution(
  contributionId: string,
  userId?: string,
) {
  const id = userId ?? (await requireUserId());
  const db = requireDb();

  const contribution = await db.query.planningGoalContributions.findFirst({
    where: eq(planningGoalContributions.id, contributionId),
    with: { goal: true },
  });
  if (!contribution?.goal || contribution.goal.userId !== id) {
    throw new Error("Contribution not found");
  }

  await db
    .delete(planningGoalContributions)
    .where(eq(planningGoalContributions.id, contributionId));
}
