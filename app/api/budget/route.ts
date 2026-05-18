import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { requireDb, budgets } from "@/lib/db";
import { upsertBudgetFromIncome } from "@/lib/users/service";
import { generateBudgetPlan } from "@/lib/finance/budget-engine";

const postSchema = z.object({
  monthlyIncome: z.number().positive(),
});

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    const db = requireDb();
    const budget = await db.query.budgets.findFirst({
      where: eq(budgets.userId, userId),
    });
    const plan = budget
      ? generateBudgetPlan(Number(budget.monthlyIncome))
      : null;
    return NextResponse.json({ budget, plan });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    const { monthlyIncome } = postSchema.parse(await request.json());
    const budget = await upsertBudgetFromIncome(userId, monthlyIncome);
    const plan = generateBudgetPlan(monthlyIncome);
    return NextResponse.json({ budget, plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
