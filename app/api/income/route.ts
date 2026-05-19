import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth/session";
import {
  logIncomeEntry,
  getMonthlyIncomeEntries,
} from "@/lib/finance/income-service";

const postSchema = z.object({
  amount: z.number().positive(),
  source: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    const entries = await getMonthlyIncomeEntries(userId);
    return NextResponse.json({ income: entries });
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
    const row = await logIncomeEntry(
      userId,
      body.amount,
      body.source,
      body.description,
    );
    return NextResponse.json({ entry: row });
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
