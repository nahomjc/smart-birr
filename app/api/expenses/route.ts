import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth/session";
import { logExpense, getMonthlyExpenses } from "@/lib/users/service";
import { normalizeCategory } from "@/lib/finance/categories";

const postSchema = z.object({
  amount: z.number().positive(),
  category: z.string(),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    const { expenses } = await getMonthlyExpenses(userId);
    return NextResponse.json({ expenses });
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
    const body = postSchema.parse(await request.json());
    const row = await logExpense(
      userId,
      body.amount,
      normalizeCategory(body.category),
      body.description,
    );
    return NextResponse.json({ expense: row });
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
