import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateWebUser, getUserById, updateUserIncome, upsertBudgetFromIncome } from "@/lib/users/service";
import { setSessionUserId, getSessionUserId } from "@/lib/auth/session";

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  income: z.number().positive().optional(),
});

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ user: null });
    }
    const user = await getUserById(userId);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { name, income } = bodySchema.parse(json);
    const user = await getOrCreateWebUser(name, income);
    if (income) {
      await updateUserIncome(user.id, income);
      await upsertBudgetFromIncome(user.id, income);
    }
    await setSessionUserId(user.id);
    const updated = await getUserById(user.id);
    return NextResponse.json({ user: updated });
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
