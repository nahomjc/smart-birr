import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth/session";
import { dateKeyToLocalDate, isValidDateKey } from "@/lib/finance/period";
import { updateRecurringExpense } from "@/lib/finance/recurring-service";

const patchSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  frequency: z.enum(["monthly", "weekly"]).optional(),
  nextDueAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = patchSchema.parse(await request.json());

    let nextDueAt: Date | undefined;
    if (body.nextDueAt) {
      if (!isValidDateKey(body.nextDueAt)) {
        return NextResponse.json(
          { error: "nextDueAt must be YYYY-MM-DD" },
          { status: 400 },
        );
      }
      nextDueAt = dateKeyToLocalDate(body.nextDueAt);
    }

    const row = await updateRecurringExpense(userId, id, {
      amount: body.amount,
      category: body.category,
      description: body.description,
      frequency: body.frequency,
      nextDueAt,
      isActive: body.isActive,
    });

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ recurring: row });
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
